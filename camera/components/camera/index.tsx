import * as React from "react";
import { PropType, registerComponent } from "@uiflow/cli";
import Webcam from "react-webcam";

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
    ],
    blocks: [
        {
            output: {
                type: PropType.Event,
                name: 'onCaptured',
                arguments: [
                    {
                        name: 'imageSrc',
                        type: PropType.String,
                    },
                ],
            }
        },
        {
            output: {
                type: PropType.Event,
                name: 'onRecorded',
                arguments: [
                    {
                        name: 'videoUrl',
                        type: PropType.String,
                    },
                ],
            }
        }
    ],
    render({ props, emit }) {
        const videoConstraints = {
            width: props.width,
            height: props.height,
            facingMode: "user"
        };

        const [deviceAvailable, setDeviceAvailable] = React.useState(false);

        const webcamRef = React.useRef<any>(null);
        const mediaRecorderRef = React.useRef<any>(null);
        const [recording, setRecording] = React.useState(false);
        const [recordedChunks, setRecordedChunks] = React.useState([]);

        const [videoUrl, setVideoUrl] = React.useState("");
        const [imageSrc, setImageSrc] = React.useState("");

        const handleCapture = () => {
            captureCamera();
        };

        const captureCamera = React.useCallback(
            () => {
                if (!webcamRef || !webcamRef.current) return;
                const _imageSrc = webcamRef.current.getScreenshot();
                emit("onCaptured", { imageSrc: _imageSrc });
                setImageSrc(_imageSrc);
                setVideoUrl("");
            },
            [webcamRef]
        );

        const handleRecord = () => {
            if (recording) stopRecord();
            else startRecord();
            setRecording(!recording);
        };

        const startRecord = React.useCallback(() => {
            mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
                mimeType: "video/webm"
            });
            mediaRecorderRef.current.addEventListener(
                "dataavailable",
                handleDataAvailable
            );
            mediaRecorderRef.current.start();
        }, [webcamRef, mediaRecorderRef, setRecording]);

        const stopRecord = React.useCallback(() => {
            mediaRecorderRef.current.stop();
        }, [mediaRecorderRef, webcamRef, setRecording]);

        const handleDataAvailable = React.useCallback(
            ({ data }) => {
                if (data.size > 0) {
                    setRecordedChunks((prev) => prev.concat(data));
                }
            },
            [setRecordedChunks]
        );

        React.useEffect(() => {
            navigator.mediaDevices.enumerateDevices().then(devices => {
                const video_devices = devices.filter(device => device.kind === "videoinput");
                setDeviceAvailable(video_devices.length > 0);
            });
        }, [navigator.mediaDevices]);

        React.useEffect(() => {
            if (recording || !recordedChunks || recordedChunks.length === 0) return;

            const blob = new Blob(recordedChunks, {
                type: "video/webm"
            });
            const url = URL.createObjectURL(blob);
            emit("onRecorded", { url });
            setVideoUrl(url);
            setImageSrc("");
            setRecordedChunks([]);
        }, [recording, recordedChunks]);

        if (!deviceAvailable) {
            return <span>No cameras detected.</span>;
        }

        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }} >
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    width={props.width}
                    height={props.height}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", alignItems: "center", marginTop: "10px" }}>
                    <button
                        style={{ backgroundColor: "lightgrey", padding: "6px" }}
                        onClick={handleCapture}
                    >
                        Capture photo
                    </button>
                    <button
                        style={{ backgroundColor: recording ? "gray" : "darkgray", padding: "6px" }}
                        onClick={handleRecord}
                    >
                        {recording ? "Stop Record" : "Start Record"}
                    </button>
                </div>
                <div>
                    {imageSrc.length > 0 ? (
                        <img
                            style={{ marginTop: "20px" }}
                            width={props.width}
                            height={props.height}
                            src={imageSrc}
                            alt=""
                        />
                    ) : videoUrl.length > 0 ? (
                        <video width={props.width} height={props.height} controls autoPlay style={{ marginTop: "20px" }}>
                            <source src={videoUrl} type="video/webm" />
                        </video>
                    ) : ""}
                </div>
            </div >
        );
    }
});