all:
	make prepare
	make linux
	make macos
	make windows
	make webapp
	make pack

prepare:
	rm -f mattermost-audiourl-plugin.tar.gz
	rm -rf mattermost-audiourl-plugin
	mkdir -p mattermost-audiourl-plugin
	mkdir -p mattermost-audiourl-plugin/client
	mkdir -p mattermost-audiourl-plugin/server

linux:
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o mattermost-audiourl-plugin/server/plugin-linux-amd64 server/plugin.go

macos:
	CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o mattermost-audiourl-plugin/server/plugin-darwin-amd64 server/plugin.go

windows:
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o mattermost-audiourl-plugin/server/plugin-windows-amd64 server/plugin.go

webapp:
	mkdir -p dist
	npm install
	./node_modules/.bin/webpack --mode=production

pack:
	cp -r dist/main.js mattermost-audiourl-plugin/client
	cp plugin.json mattermost-audiourl-plugin/
	tar -czvf mattermost-audiourl-plugin.tar.gz mattermost-audiourl-plugin
