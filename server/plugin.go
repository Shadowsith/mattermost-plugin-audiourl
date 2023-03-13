package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/mattermost/mattermost-server/v6/plugin"
)

// AudioUrlPlugin implements the interface expected by the Mattermost server to communicate
// between the server and plugin processes.
type AudioUrlPlugin struct {
	plugin.MattermostPlugin
}

type PluginSettings struct {
	Width     int    `json:"width"`
	Blacklist string `json:"blacklist"`
	Mp3       bool   `json:"mp3"`
	M4a       bool   `json:"m4a"`
	Ogg       bool   `json:"ogg"`
	Oga       bool   `json:"oga"`
	Wav       bool   `json:"wav"`
}

const (
	routeSettings = "/settings"
)

// ServeHTTP demonstrates a plugin that handles HTTP requests by greeting the world.
func (p *AudioUrlPlugin) ServeHTTP(c *plugin.Context, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	settings := p.getSettings(w)
	res := p.handleSettingsResult(settings)
	fmt.Fprint(w, res)
}

func (p *AudioUrlPlugin) getSettings(w http.ResponseWriter) PluginSettings {
	pluginSettings, ok := p.API.GetConfig().PluginSettings.Plugins["audiourl"]
	settings := PluginSettings{
		Width:     350,
		Blacklist: "",
		Mp3:       true,
		M4a:       true,
		Ogg:       true,
		Oga:       true,
		Wav:       true,
	}
	if ok {
		for k, v := range pluginSettings {
			switch k {
			case "width":
				width, err := strconv.Atoi(
					fmt.Sprintf("%v", v))
				if err != nil {
					log.Fatal(err)
				}
				settings.Width = width
				break

			case "blacklist":
				settings.Blacklist = v.(string)
				break

			case "mp3":
				settings.Mp3 = p.getBoolVal(v)
				break

			case "m4a":
				settings.M4a = p.getBoolVal(v)
				break

			case "ogg":
				settings.Ogg = p.getBoolVal(v)
				break

			case "oga":
				settings.Oga = p.getBoolVal(v)
				break
			}
		}
	}
	return settings
}

func (p *AudioUrlPlugin) getBoolVal(v interface{}) bool {
	val, ok := v.(bool)
	if !ok {
		val = true
	}
	return val
}

func (p *AudioUrlPlugin) handleSettingsResult(settings PluginSettings) string {
	json, err := json.Marshal(&settings)
	if err != nil {
		return "{}"
	} else {
		return string(json)
	}
}

// This example demonstrates a plugin that handles HTTP requests which respond by greeting the
// world.
func main() {
	plugin.ClientMain(&AudioUrlPlugin{})
}
