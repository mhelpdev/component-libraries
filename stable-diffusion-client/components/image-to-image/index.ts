import { PropType, registerComponent } from '@uiflow/cli';
import { grpc as GRPCWeb } from '@improbable-eng/grpc-web';
import { Buffer } from 'buffer';
import * as Generation from '../../generation/generation_pb';
import { GenerationServiceClient } from '../../generation/generation_pb_service';
import {
  buildGenerationRequest,
  executeGenerationRequest,
  onGenerationComplete,
} from '../../helper/helpers';
import { b64toBlob, fetchImageBuffer } from '../../helper/utils';

export default registerComponent('image-to-image-ufw-component', {
  name: 'Image To Image',
  props: [
    {
      name: 'api_key',
      type: PropType.String,
      value: ''
    },
    {
      name: 'imageStrength',
      type: PropType.Number,
      value: 0.35
    },
    {
      name: 'seed',
      type: PropType.Number,
      value: 1413160511
    },
    {
      name: 'samples',
      type: PropType.Number,
      value: 1
    },
    {
      name: 'cfgScale',
      type: PropType.Number,
      value: 8
    },
    {
      name: 'steps',
      type: PropType.Number,
      value: 30
    },
    {
      name: "sampler",
      type: PropType.String,
      value: `${Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M}`,
      options: [
        `${Generation.DiffusionSampler.SAMPLER_DDIM}`,
        `${Generation.DiffusionSampler.SAMPLER_DDPM}`,
        `${Generation.DiffusionSampler.SAMPLER_K_EULER}`,
        `${Generation.DiffusionSampler.SAMPLER_K_EULER_ANCESTRAL}`,
        `${Generation.DiffusionSampler.SAMPLER_K_HEUN}`,
        `${Generation.DiffusionSampler.SAMPLER_K_DPM_2}`,
        `${Generation.DiffusionSampler.SAMPLER_K_DPM_2_ANCESTRAL}`,
        `${Generation.DiffusionSampler.SAMPLER_K_LMS}`,
        `${Generation.DiffusionSampler.SAMPLER_K_DPMPP_2S_ANCESTRAL}`,
        `${Generation.DiffusionSampler.SAMPLER_K_DPMPP_2M}`,
        `${Generation.DiffusionSampler.SAMPLER_K_DPMPP_SDE}`
      ]
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
            value: 'sketchy crayon outline on old paper of a rocket-ship launching from rolling greens with blue daisies and weeping willow trees under a blue alien sky',
          },
          {
            name: 'image',
            type: PropType.String,
          },
        ],
        async onEmit({ props, inputs, emit }) {
          const metadata = new GRPCWeb.Metadata();
          metadata.set('Authorization', 'Bearer ' + props.api_key);

          const client = new GenerationServiceClient('https://grpc.stability.ai', {});

          const imageBuffer = await fetchImageBuffer(inputs.image);

          const request = buildGenerationRequest('stable-diffusion-512-v2-1', {
            type: 'image-to-image',
            prompts: [
              {
                text: inputs.prompt,
              },
            ],
            stepScheduleStart: 1 - props.imageStrength,
            initImage: imageBuffer,
            seed: props.seed,
            samples: props.samples,
            cfgScale: props.cfgScale,
            steps: props.steps,
            sampler: props.sampler,
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
                emit('onError', { error: 'Failed to make image-to-image request' });
              }
            })
            .catch((error) => {
              emit('onError', { error });
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