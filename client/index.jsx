import React from 'react';
import axios from 'axios';

class PluginSettings {
    constructor(data) {
        /**
         * @type {number}
         */
        this.width = data.width;
        /**
         * @type {boolean}
         */
        this.mp3 = data.mp3 == null ? true : data.mp3;
        /**
         * @type {boolean}
         */
        this.m4a = data.m4a == null ? true : data.m4a;
        /**
         * @type {boolean}
         */
        this.ogg = data.ogg == null ? true : data.ogg;
        /**
         * @type {boolean}
         */
        this.oga = data.oga == null ? true : data.oga;
        /**
         * @type {boolean}
         */
        this.wav = data.wav == null ? true : data.wav;
        /**
         * @type {string[]}
         */
        this.blacklist = null;
        try {
            this.blacklist = data.blacklist
                .replaceAll(' ', '').split(',');
            if (this.blacklist[0] == "") {
                this.blacklist = null;
            }
        } catch {
        }
    }
}

class PostWillRenderEmbed extends React.Component {
    static plugin;
    /**
     * @type {PluginSettings}
     */
    static settings;

    render() {
        let width = 350;
        try {
            if (PostWillRenderEmbed.settings != null) {
                width = PostWillRenderEmbed.settings.width;
            } else if (PostWillRenderEmbed.plugin.props.width != null) {
                width = PostWillRenderEmbed.plugin.props.width;
            }
        } catch {
        }
        const css = `
            .audiourl-mw {
                width: ${width}px;
                min-width: ${width}px;
            }`

        const fileType = this.getAudioUrlType(this.props.embed.url);

        return (
            <div>
                <style>{css}</style>
                <audio controls class="audiourl-mw">
                    <source src={this.props.embed.url} type={fileType} />
                    Your browser does not support the audio tag.
                </audio>
            </div>
        );
    }

    /**
     * 
     * @param {string} url 
     * @returns string
     */
    getAudioUrlType(url) {
        try {
            const split = url.toLowerCase().split('.');
            switch (split[split.length - 1]) {
                case 'mp3':
                    return 'audio/mpeg';

                case 'm4a':
                    return 'audio/m4a';

                case 'oga':
                case 'ogg':
                    return 'audio/ogg';

                case 'wav':
                    return 'audio/wav';

                default:
                    return 'audio/mpeg';
            }
        } catch {
            return 'audio/mpeg';
        }
    }
}

class AudioUrlPlugin {
    static apiUrl = '/plugins/audiourl';

    initialize(registry, store) {
        const plugin = store.getState().plugins.plugins.audiourl;
        PostWillRenderEmbed.plugin = plugin;
        axios.get(`${AudioUrlPlugin.apiUrl}/settings`)
            .then(res => {
                /**
                 * @type {PluginSettings}
                 */
                const settings = new PluginSettings(res.data);
                PostWillRenderEmbed.settings = settings;
                registry.registerPostWillRenderEmbedComponent(
                    (embed) => {
                        try {
                            const url = embed.url;
                            const isFileSupported = (
                                (url.includes('.mp3') && settings.mp3)
                                || (url.includes('.m4a') && settings.m4a)
                                || (url.includes('.ogg') && settings.ogg)
                                || (url.includes('.oga') && settings.oga)
                                || (url.includes('.wav') && settings.wav)
                            );
                            if (embed.type == 'link' && isFileSupported) {
                                if (settings.blacklist != null) {
                                    const blacklisted = settings.blacklist.find(x => {
                                        return url.includes(x);
                                    });
                                    if (blacklisted != null) {
                                        return false;
                                    }
                                }
                                return true;
                            }
                            return false;
                        } catch (error) {
                            return false;
                        }
                    },
                    PostWillRenderEmbed,
                    false,
                );
            })
            .catch(err => {
                console.log('AudioUrl Settings Err', err);
                registry.registerPostWillRenderEmbedComponent(
                    (embed) => {
                        try {
                            if (embed.type == 'link'
                                && (
                                    embed.url.includes('.mp3')
                                    || embed.url.includes('.m4a')
                                    || embed.url.includes('.ogg')
                                    || embed.url.includes('.oga')
                                    || embed.url.includes('.wav')
                                )
                            ) {
                                return true;
                            }
                            return false;
                        } catch {
                            return false;
                        }
                    },
                    PostWillRenderEmbed,
                    false,
                );
            });
    }

    uninitialize() {
        // No clean up required.
    }
}

window.registerPlugin('audiourl', new AudioUrlPlugin());