import { PropType, registerComponent } from '@uiflow/cli';
import { grpc as GRPCWeb } from "@improbable-eng/grpc-web";
import * as Generation from "../../generation/generation_pb";
import { GenerationServiceClient } from "../../generation/generation_pb_service";
import {
  buildGenerationRequest,
  executeGenerationRequest,
  onGenerationComplete,
} from "../../helper/helpers";
import { b64toBlob } from '../../helper/utils';

export default registerComponent('text-to-image-ufw-component', {
  name: 'Text To Image',
  props: [
    {
      name: 'api_key',
      type: PropType.String,
      value: ''
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
            value: 'A dream of a distant galaxy, by Caspar David Friedrich, matte painting trending on artstation HQ',
          },
          {
            name: 'width',
            type: PropType.Number,
            value: 512,
          },
          {
            name: 'height',
            type: PropType.Number,
            value: 512,
          }
        ],
        async onEmit({ props, inputs, emit }) {
          const metadata = new GRPCWeb.Metadata();
          metadata.set("Authorization", "Bearer " + props.api_key);

          const client = new GenerationServiceClient("https://grpc.stability.ai", {});

          const request = buildGenerationRequest("stable-diffusion-512-v2-1", {
            type: "text-to-image",
            prompts: [
              {
                text: inputs.prompt
              },
            ],
            width: inputs.width,
            height: inputs.height,
            samples: 1,
            cfgScale: 13,
            steps: 25,
            sampler: Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M,
          });

          executeGenerationRequest(client, request, metadata)
            .then(onGenerationComplete)
            .then((images: string[]) => {
              // images: array of base64 data
              if (images.length > 0) {
                const contentType = 'image/png';
                const blob = b64toBlob(images[0], contentType);
                const blobUrl = URL.createObjectURL(blob);
                emit('onResult', { src: blobUrl });
              } else {
                emit('onError', { error: 'No images' })
              }
            })
            .catch((_) => {
              emit('onError', { error: 'Failed to make text-to-image request' });
            });
        },
      },
      output: [
        {
          type: PropType.Event,
          name: 'onResult',
          arguments: [
            {
              name: 'src',
              type: PropType.String,
            },
          ],
        },
        {
          type: PropType.Event,
          name: 'onError',
          arguments: [
            {
              name: 'error',
              type: PropType.Object,
            },
          ],
        },
      ]
    }
  ]
});