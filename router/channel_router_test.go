package router

import (
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/plushubai/plushub4deliver/common"
	"github.com/plushubai/plushub4deliver/controller"
	"github.com/plushubai/plushub4deliver/model"
	"github.com/plushubai/plushub4deliver/service"
	"github.com/plushubai/plushub4deliver/service/authz"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestChannelDefaultBaseURLsRequireReadPermission(t *testing.T) {
	assertChannelRoutePermission(t, http.MethodGet, "/default_base_urls", authz.ChannelRead, controller.GetChannelDefaultBaseURLs)

	gin.SetMode(gin.TestMode)
	engine := gin.New()
	registerChannelRoutes(engine.Group("/api"))
	recorder := httptest.NewRecorder()
	engine.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/channel/default_base_urls", nil))
	assert.Equal(t, http.StatusUnauthorized, recorder.Code)
}

func TestChannelStatusRoutesUseExpectedPermissions(t *testing.T) {
	assertChannelRoutePermission(t, http.MethodGet, "/priority/order", authz.ChannelRead, controller.GetChannelPriorityOrder)
	assertChannelRoutePermission(t, http.MethodPost, "/priority/reorder", authz.ChannelWrite, controller.ReorderChannelPriority)
	assertChannelRoutePermission(t, http.MethodGet, "/:id/vllm/status", authz.ChannelRead, controller.GetVLLMChannelStatus)
	assertChannelRoutePermission(t, http.MethodGet, "/:id/sglang/status", authz.ChannelRead, controller.GetSGLangChannelStatus)
	assertChannelRoutePermission(t, http.MethodPost, "/:id/status", authz.ChannelOperate, controller.UpdateChannelStatus)
	assertChannelRoutePermission(t, http.MethodPost, "/status/batch", authz.ChannelOperate, controller.BatchUpdateChannelStatus)
	assertChannelRoutePermission(t, http.MethodPut, "/", authz.ChannelWrite, controller.UpdateChannel)
}

func TestChannelDeleteRoutesUseSensitiveWritePermission(t *testing.T) {
	assertChannelRoutePermission(t, http.MethodDelete, "/:id", authz.ChannelSensitiveWrite, controller.DeleteChannel)
	assertChannelRoutePermission(t, http.MethodPost, "/batch", authz.ChannelSensitiveWrite, controller.DeleteChannelBatch)
	assertChannelRoutePermission(t, http.MethodDelete, "/disabled", authz.ChannelSensitiveWrite, controller.DeleteDisabledChannel)
	assertChannelRoutePermission(t, http.MethodPut, "/", authz.ChannelWrite, controller.UpdateChannel)
	assertChannelRoutePermission(t, http.MethodPut, "/tag", authz.ChannelWrite, controller.EditTagChannels)
	assertChannelRoutePermission(t, http.MethodPost, "/batch/tag", authz.ChannelWrite, controller.BatchSetChannelTag)
}

func TestPluginLoginRoutesUseExpectedPermissions(t *testing.T) {
	assertChannelRoutePermission(t, http.MethodPost, "/:id/plugin_login", authz.ChannelSensitiveWrite, controller.StartPluginLogin)
	assertChannelRoutePermission(t, http.MethodPost, "/:id/plugin_login/continue", authz.ChannelSensitiveWrite, controller.ContinuePluginLogin)
	assertChannelRoutePermission(t, http.MethodPost, "/plugin_login/callback", authz.ChannelSensitiveWrite, controller.CompletePluginLoginCallback)
	assertChannelRoutePermission(t, http.MethodGet, "/:id/plugin_credentials", authz.ChannelRead, controller.GetPluginCredentials)
}

func TestChannelStatusRoutesRegisterWithoutConflict(t *testing.T) {
	gin.SetMode(gin.TestMode)
	engine := gin.New()
	api := engine.Group("/api")

	require.NotPanics(t, func() {
		registerChannelRoutes(api)
	})
}

func TestChannelManagementSwitch(t *testing.T) {
	setupRelayRouterTestDB(t)
	require.NoError(t, model.DB.AutoMigrate(&model.UserSession{}, &model.AuditLog{}))
	root := model.User{
		Username: "channel-test-root", Role: common.RoleRootUser,
		Status: common.UserStatusEnabled, AuthVersion: 1,
	}
	require.NoError(t, model.DB.Create(&root).Error)
	session, err := service.CreateLoginSession(root.Id, "password", "127.0.0.1", "router-test")
	require.NoError(t, err)

	assertStatus := func(engine *gin.Engine, enabled bool) {
		t.Helper()
		engine.GET("/api/status", controller.GetStatus)
		recorder := httptest.NewRecorder()
		engine.ServeHTTP(recorder, httptest.NewRequest(http.MethodGet, "/api/status", nil))
		require.Equal(t, http.StatusOK, recorder.Code)
		var status struct {
			Data struct {
				ChannelManagementEnabled *bool `json:"channel_management_enabled"`
			} `json:"data"`
		}
		require.NoError(t, common.Unmarshal(recorder.Body.Bytes(), &status))
		require.NotNil(t, status.Data.ChannelManagementEnabled)
		assert.Equal(t, enabled, *status.Data.ChannelManagementEnabled)
	}

	previous := common.ChannelManagementEnabled
	t.Cleanup(func() { common.ChannelManagementEnabled = previous })
	common.ChannelManagementEnabled = false
	closed := gin.New()
	registerChannelRoutes(closed.Group("/api"))
	assertStatus(closed, false)

	for _, tc := range []struct {
		method string
		path   string
	}{
		{http.MethodPost, "/api/channel/"},
		{http.MethodPost, "/api/channel/copy/1"},
		{http.MethodPut, "/api/channel/"},
		{http.MethodDelete, "/api/channel/1"},
		{http.MethodPost, "/api/channel/1/key"},
		{http.MethodPost, "/api/channel/1/plugin_login"},
		{http.MethodGet, "/api/channel/update_balance/1"},
	} {
		t.Run(tc.method+" "+tc.path, func(t *testing.T) {
			req := httptest.NewRequest(tc.method, tc.path, nil)
			req.Header.Set("Authorization", "Bearer "+session.AccessToken)
			recorder := httptest.NewRecorder()
			closed.ServeHTTP(recorder, req)
			assert.Equal(t, http.StatusForbidden, recorder.Code)
		})
	}

	read := httptest.NewRequest(http.MethodGet, "/api/channel/default_base_urls", nil)
	read.Header.Set("Authorization", "Bearer "+session.AccessToken)
	recorder := httptest.NewRecorder()
	closed.ServeHTTP(recorder, read)
	require.Equal(t, http.StatusOK, recorder.Code)

	common.ChannelManagementEnabled = true
	open := gin.New()
	registerChannelRoutes(open.Group("/api"))
	assertStatus(open, true)

	recorder = httptest.NewRecorder()
	open.ServeHTTP(recorder, httptest.NewRequest(http.MethodPost, "/api/channel/", nil))
	require.Equal(t, http.StatusUnauthorized, recorder.Code)

	add := httptest.NewRequest(http.MethodPost, "/api/channel/", nil)
	add.Header.Set("Authorization", "Bearer "+session.AccessToken)
	recorder = httptest.NewRecorder()
	open.ServeHTTP(recorder, add)
	require.Equal(t, http.StatusOK, recorder.Code)
	assert.JSONEq(t, `{"success":false,"message":"EOF"}`, recorder.Body.String())

	key := httptest.NewRequest(http.MethodPost, "/api/channel/1/key", nil)
	key.Header.Set("Authorization", "Bearer "+session.AccessToken)
	recorder = httptest.NewRecorder()
	open.ServeHTTP(recorder, key)
	require.Equal(t, http.StatusForbidden, recorder.Code)
	assert.Contains(t, recorder.Body.String(), "SECURITY_PROOF_REQUIRED")
}

func assertChannelRoutePermission(t *testing.T, method string, path string, permission authz.Permission, handler any) {
	t.Helper()
	for _, route := range channelPermissionRoutes {
		if route.method == method && route.path == path {
			assert.Equal(t, permission, route.permission)
			assert.Equal(t, reflect.ValueOf(handler).Pointer(), reflect.ValueOf(route.handler).Pointer())
			return
		}
	}
	t.Fatalf("route %s %s not found", method, path)
}
