package delivery

import (
	_ "embed"

	"github.com/plushubai/plushub4deliver/common"
)

//go:embed site.json
var siteJSON []byte

var Site struct {
	SystemName string
	Logo       string
}

func init() {
	if err := common.Unmarshal(siteJSON, &Site); err != nil {
		panic(err)
	}
}

const legacyLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCIgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4Ij4KICA8cmVjdCB4PSIxOC43NSIgeT0iNS4yNSIgd2lkdGg9IjEwLjUiIGhlaWdodD0iMzcuNSIgcng9IjUuMjUiIGZpbGw9IiMxQzdBRkYiIC8+CiAgPHJlY3QgeD0iNS4yNSIgeT0iMTguNzUiIHdpZHRoPSIzNy41IiBoZWlnaHQ9IjEwLjUiIHJ4PSI1LjI1IiBmaWxsPSIjMUM3QUZGIiAvPgogIDxjaXJjbGUgY3g9IjI0IiBjeT0iMjQiIHI9IjQuMyIgZmlsbD0iI0ZGRkZGRiIgLz4KICA8Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyLjYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzFDN0FGRiIgc3Ryb2tlLXdpZHRoPSIxLjMiIC8+Cjwvc3ZnPgo="

// Some installations saved the original delivery defaults as explicit options.
func DisplayOption(key, value string) string {
	switch key {
	case "SystemName":
		if value == "jayhub" {
			return Site.SystemName
		}
	case "Logo":
		if value == legacyLogo {
			return Site.Logo
		}
	}
	return value
}
