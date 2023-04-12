import * as React from "react";
import { PropType, registerComponent } from "@uiflow/cli";
import Webcam from "react-webcam";
import { b64toBlob } from "../../helper/utils";

export default registerComponent("camera-ufw-component", {
    name: "Camera",
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
            name: "imageFormat",
            type: PropType.String,
            value: "image/jpeg",
            options: ["image/jpeg", "image/png"],
        },
        {
            name: "camRef",
            type: PropType.Object,
        },
        {
            name: "recordRef",
            type: PropType.Object,
        },
        {
            name: "recording",
            type: PropType.Boolean,
            value: false,
        }
    ],
    blocks: [
        {
            input: {
                name: 'Capture Photo',
                type: PropType.Call,
                onEmit({ props, emit }) {
                    const webcamRef = props.camRef;
                    if (!webcamRef || !webcamRef.current) return;

                    const photoImage = webcamRef.current.getScreenshot();
                    const contentType = props.imageFormat;
                    const sIndex = photoImage.indexOf("base64");
                    const b64Image = photoImage.slice(sIndex + 7);
                    const blob = b64toBlob(b64Image, contentType);
                    const src = URL.createObjectURL(blob);
                    emit("onCaptured", { src: src });
                }
            },
            output: {
                type: PropType.Event,
                name: 'onCaptured',
                arguments: [
                    {
                        name: 'src',
                        type: PropType.String,
                    },
                ],
            }
        },
        {
            input: {
                name: 'Start Record',
                type: PropType.Call,
                onEmit({ props, setProps, emit }) {
                    if (props.recording) return;

                    const webcamRef = props.camRef;
                    const mediaRecorderRef = props.recordRef;
                    if (!webcamRef || !webcamRef.current) return;

                    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
                        mimeType: "video/webm"
                    });

                    mediaRecorderRef.current.addEventListener(
                        "dataavailable",
                        (ev: BlobEvent) => {
                            const { data } = ev;
                            if (data.size > 0) {
                                const url = URL.createObjectURL(data);
                                emit("onStopRecord", { url });
                            }
                        }
                    );
                    mediaRecorderRef.current.start();
                    emit("onStartRecord");
                    setProps({ "recording": true });
                }
            },
            output: {
                type: PropType.Event,
                name: 'onStartRecord',
            }
        },
        {
            input: {
                name: 'Stop Record',
                type: PropType.Call,
                onEmit({ props, setProps, emit }) {
                    if (!props.recording) return;

                    const webcamRef = props.camRef;
                    const mediaRecorderRef = props.recordRef;
                    if (!webcamRef || !webcamRef.current) return;

                    mediaRecorderRef.current.stop();
                    emit("onStopRecord");
                    setProps({ "recording": false });
                }
            },
            output: {
                type: PropType.Event,
                name: 'onStopRecord',
                arguments: [
                    {
                        name: 'url',
                        type: PropType.String,
                    },
                ],
            }
        }
    ],
    render({ props, setProps }) {
        const videoConstraints = {
            width: props.width,
            height: props.height,
            facingMode: "user"
        };

        const [deviceAvailable, setDeviceAvailable] = React.useState(false);
        const [initRef, setInitRef] = React.useState(false);

        const webcamRef = React.useRef<any>(null);
        const mediaRecorderRef = React.useRef<any>(null);

        React.useEffect(() => {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                const video_devices = devices.filter(device => device.kind === "videoinput");
                setDeviceAvailable(video_devices.length > 0);
            });
        }, [navigator.mediaDevices]);

        React.useEffect(() => {
            if (!deviceAvailable || !webcamRef || initRef) return;
            setInitRef(true);
            setProps({ "camRef": webcamRef, "recordRef": mediaRecorderRef });
        }, [webcamRef, deviceAvailable]);

        if (!deviceAvailable) {
            return <span>No cameras detected.</span>;
        }

        return (
            <Webcam
                audio={false}
                ref={webcamRef}
                width={props.width}
                height={props.height}
                screenshotFormat={props.imageFormat}
                videoConstraints={videoConstraints}
            />
        );
    }
});