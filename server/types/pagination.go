package types

type PaginationResponse struct {
	Data  interface{} `json:"data"`
	Total int64       `json:"total"`
	Page  int         `json:"page"`
	Limit int         `json:"limit"`
}

type PaginationParams struct {
	Page  int `json:"page" query:"page"`
	Limit int `json:"limit" query:"limit"`
}
