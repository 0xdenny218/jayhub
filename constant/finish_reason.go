package constant

import "github.com/plushubai/plushub4deliver/relaykit/types"

// Finish reasons moved to types with the conversion kit.
var (
	FinishReasonStop          = types.FinishReasonStop
	FinishReasonToolCalls     = types.FinishReasonToolCalls
	FinishReasonLength        = types.FinishReasonLength
	FinishReasonFunctionCall  = types.FinishReasonFunctionCall
	FinishReasonContentFilter = types.FinishReasonContentFilter
)
