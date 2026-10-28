package domain

import "testing"

func TestConditionsMatch(t *testing.T) {
	home := int64(1)
	url := func(group int, op ConditionOperator, value string) SnippetCondition {
		return SnippetCondition{GroupIndex: group, Field: ConditionFieldURL, Operator: op, Value: value}
	}
	page := func(group int, op ConditionOperator, id int64) SnippetCondition {
		return SnippetCondition{GroupIndex: group, Field: ConditionFieldPage, Operator: op, PageID: &id}
	}
	tests := []struct {
		name       string
		conditions []SnippetCondition
		pageID     *int64
		path       string
		want       bool
	}{
		{"no conditions", nil, nil, "/anything", true},
		{"AND: both match", []SnippetCondition{url(0, ConditionOperatorContains, "/casinos"), url(0, ConditionOperatorNotContain, "/review")}, nil, "/casinos/sg", true},
		{"AND: one fails", []SnippetCondition{url(0, ConditionOperatorContains, "/casinos"), url(0, ConditionOperatorNotContain, "/review")}, nil, "/casinos/review", false},
		{"OR: second group matches", []SnippetCondition{url(0, ConditionOperatorContains, "/casinos"), page(1, ConditionOperatorIs, home)}, &home, "/", true},
		{"OR: no group matches", []SnippetCondition{url(0, ConditionOperatorContains, "/casinos"), url(1, ConditionOperatorIs, "/news")}, nil, "/guides", false},
		{"(A AND B) OR C: first group", []SnippetCondition{url(0, ConditionOperatorContains, "/sg"), url(0, ConditionOperatorContains, "bonus"), url(1, ConditionOperatorIs, "/")}, nil, "/sg/bonus", true},
		{"(A AND B) OR C: neither", []SnippetCondition{url(0, ConditionOperatorContains, "/sg"), url(0, ConditionOperatorContains, "bonus"), url(1, ConditionOperatorIs, "/")}, nil, "/sg/news", false},
		{"groups need not be numbered in order", []SnippetCondition{url(3, ConditionOperatorIs, "/a"), url(0, ConditionOperatorIs, "/b")}, nil, "/a", true},
	}
	for _, tt := range tests {
		if got := ConditionsMatch(tt.conditions, tt.pageID, tt.path); got != tt.want {
			t.Errorf("%s: got %v, want %v", tt.name, got, tt.want)
		}
	}
}
