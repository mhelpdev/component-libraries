import * as React from "react";
import "regenerator-runtime";
import { PropType, registerComponent } from "@uiflow/cli";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

type SpeechRecognitionProps = {
  onTouchEnd: (x: string) => void
};

const SpeechRecognitionButton = ({ onTouchEnd }: SpeechRecognitionProps) => {
  const {
    transcript,
    listening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  function startListening() {
    SpeechRecognition.startListening({ continuous: true });
  }

  function stopListening() {
    SpeechRecognition.stopListening();
    onTouchEnd(transcript);
  }

  return (
    <button
      onTouchStart={() => startListening()}
      onMouseDown={() => startListening()}
      onTouchEnd={() => stopListening()}
      onMouseUp={() => stopListening()}
    >
      {listening ? "Listening" : "Hold to record"}
    </button>
  );
};

export default registerComponent("speech-recognition-ufw-component", {
  name: "Speech Recognition Button",
  props: [
    {
      name: 'onRecorded',
      type: PropType.Event,
      arguments: [
        {
          name: 'transcript',
          type: PropType.String,
        }
      ],
      onEmit({ args, emit }) {
        emit('onRecorded', { transcript: args[0] });
      }
    },
  ],
  render({ props }) {
    const onTouchEnd = (transcript: string) => {
      props.onRecorded(transcript);
    }

    return (
      <SpeechRecognitionButton
        onTouchEnd={onTouchEnd}
      />
    );
  }
});
