import { PropType, registerComponent } from "@uiflow/cli";
import * as xlsx from "xlsx";

export default registerComponent("excel-to-json", {
  name: "Excel to JSON",
  description: "Converts an excel file to a json object for use in flows",
  blocks: [
    {
      input: {
        name: "convert",
        type: PropType.Call,
        arguments: [
          {
            name: "file",
            type: PropType.Object,
            label: "Excel File",
          },
        ],
        onEmit: async ({ inputs, emit }) => {
          const file = inputs.file;
          const reader = new FileReader();
          reader.onload = async (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = xlsx.read(data, { type: "array" });
            const json = xlsx.utils.sheet_to_json(
              workbook.Sheets[workbook.SheetNames[0]]
            );
            emit("onComplete", { json });
          };
          reader.readAsArrayBuffer(file);
        },
      },
      output: {
        name: "onComplete",
        type: PropType.Event,
        arguments: [
          {
            name: "json",
            type: PropType.Object,
          },
        ],
      },
    },
  ],
});
