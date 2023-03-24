import { PropType, registerComponent } from '@uiflow/cli';
import { OpenAIApi, Configuration } from 'openai';

export default registerComponent('openai-ufw-component', {
  name: 'Open AI',
  props: [
    {
      name: 'api_key',
      type: PropType.String,
      value: ''
    },
    {
      name: 'model',
      type: PropType.String,
      value: 'text-davinci-003',
      options: ['text-davinci-003', 'text-curie-001', 'text-babbage-001', 'text-ada-001', 'code-davinci-002', 'code-cushman-001', 'gpt4'],
      description: 'The openAI model used for completion.'
    }
  ],
  blocks: [
    {
      input: {
        name: 'Call',
        type: PropType.Call,
        arguments: [
          {
            name: 'prompt',
            type: PropType.String,
            value: 'Here',
          }
        ],
        async onEmit({ props, inputs, emit }) {
          const configuration = new Configuration({
            apiKey: props.api_key,
          });
          const openai = new OpenAIApi(configuration);

          const completion = await openai.createCompletion({
            model: props.model,
            prompt: inputs.prompt,
          });
          const result = {
            'result': completion.data.choices[0].text,
            'prompt': inputs.prompt,
            'model': props.model,
            'api_key': props.api_key
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