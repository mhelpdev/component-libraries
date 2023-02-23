import { PropType, registerComponent } from '@uiflow/cli';
import * as xlsx from 'xlsx';

export default registerComponent('excel-to-json', {
    name: 'Excel to JSON',
    description:
    'Converts an excel file to a json object for use in flows',
    blocks: [
        {
            input: 
                {
                    name: 'convert',
                    type: PropType.Call,
                    label: 'Convert',
                    arguments: [
                        {
                            name: 'file',
                            type: PropType.Object, 
                            label: 'Excel File',
                        },
                    ],
                    onEmit: async ({ inputs, emit }) => {
                        // console.log("reading file" + inputs.file.name)
                        const file = inputs.file;
                        const reader = new FileReader();
                        reader.onload = async (e) => {
                            // console.log("file loaded")
                            const data = new Uint8Array(e.target.result);
                            const workbook = xlsx.read(data, { type: 'array' });
                            const json = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
                            emit('onComplete', { json });
                            // console.log("should be emitted now")
                        }
                        reader.readAsArrayBuffer(file);
                        // console.log("exiting function")
                    }
                },
            output: 
                {
                    name: 'onComplete',
                    type: PropType.Event,
                    arguments: [
                        {
                            name: 'json',
                            type: PropType.Object,
                        },
                    ],
                }
        },
    ],
});
