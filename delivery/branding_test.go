package delivery

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestDisplayOption(t *testing.T) {
	for _, tc := range []struct{ key, saved, want string }{
		{"SystemName", "jayhub", "BrainButter AI"},
		{"Logo", legacyLogo, "/brainbutter.svg"},
		{"SystemName", "Custom site", "Custom site"},
		{"Logo", "https://example.org/custom.svg", "https://example.org/custom.svg"},
		{"Notice", "jayhub", "jayhub"},
	} {
		assert.Equal(t, tc.want, DisplayOption(tc.key, tc.saved), tc.key)
	}
}
