import * as React from "react";
import { PropType, registerComponent } from "@uiflow/cli";

export default registerComponent("video-player-ufw-component", {
    name: "Video Player",
    props: [
        {
            name: "width",
            type: PropType.Number,
            value: 500
        },
        {
            name: "height",
            type: PropType.Number,
            value: 300
        },
        {
            name: "src",
            type: PropType.String,
        },
        {
            name: "type",
            type: PropType.String,
            value: "video/webm",
            options: [
                "video/mp4",
                "video/webm",
                "video/ogg",
            ]
        }
    ],
    blocks: [
        {
            input: {
                name: 'setSource',
                type: PropType.Call,
                arguments: [
                    {
                        name: "source",
                        type: PropType.String
                    }
                ],
                onEmit({ setProps, inputs }) {
                    setProps({ "src": inputs.source });
                }
            }
        }
    ],
    render({ props }) {
        return (
            <video key={props.src} width={props.width} height={props.height} controls>
                <source src={props.src} type={props.type} />
            </video>
        );
    }
});