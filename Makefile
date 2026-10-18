# page-builder Makefile
PNPM := pnpm --silent

.DEFAULT_GOAL := help
.PHONY: help install dev build preview test

help:                    ## 타깃 목록
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | sed -E 's/:.*## /\t/' | awk -F'\t' '{printf "  %-10s %s\n", $$1, $$2}'

node_modules: package.json
	pnpm install
	@touch node_modules

install: node_modules    ## 의존성 설치

dev: node_modules        ## 개발 서버 (http://<호스트>:5182)
	$(PNPM) dev

build: node_modules      ## 정적 빌드 (dist/)
	$(PNPM) build

preview: build           ## 빌드 결과 미리보기 (:5182)
	$(PNPM) preview

test: node_modules       ## 내보내기 순수 함수 테스트
	$(PNPM) test
