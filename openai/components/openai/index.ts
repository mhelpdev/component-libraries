import { PropType, registerComponent } from '@uiflow/cli';
import { OpenAIApi, Configuration } from "openai";

export default registerComponent('openai-ufw-component', {
  name: 'Open AI',
  props: [
    {
      name: "options",
      type: PropType.Object,
      value: {
        model: "text-davinci-003",
        api_key: "",
      }
    }
  ],
  blocks: [
    {
      input: {
        name: "Call",
        type: PropType.Call,
        arguments: [
          {
            name: "prompt",
            type: PropType.String,
            value: "Here",
          }
        ],
        async onEmit({ props, inputs, emit }) {
          const configuration = new Configuration({
            apiKey: props.options.api_key,
          });
          const openai = new OpenAIApi(configuration);

          const completion = await openai.createCompletion({
            model: props.options.model,
            prompt: inputs.prompt,
          });
          const result = {
            "result": completion.data.choices[0].text,
            "prompt": inputs.prompt,
            "model": props.options.model,
            "api_key": props.options.api_key
          };
          emit('onResult', { result });
        },
      },
      output: {
        type: PropType.Event,
        name: 'onResult',
        arguments: [
          {
            name: 'result',
            type: PropType.Object,
          },
        ],
      }
    }
  ]
});