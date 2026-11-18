package service

import (
	"github.com/plushubai/plushub4deliver/setting/operation_setting"
	"github.com/plushubai/plushub4deliver/setting/system_setting"
)

func GetCallbackAddress() string {
	if operation_setting.CustomCallbackAddress == "" {
		return system_setting.ServerAddress
	}
	return operation_setting.CustomCallbackAddress
}
