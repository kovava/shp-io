import {FeatureCollection} from 'geojson';
import {Writable} from 'stream';
import {FileBuffer, writeToStream} from './file-buffer';

enum FieldType {
  String = 'C',
}

interface IFieldDescription {
  type: FieldType;
  size: number;
  name: string;
}

const getFieldsDescriptions = (
  featureCollection: FeatureCollection
): Array<IFieldDescription> => {
  const fields = new Map<string, {type: FieldType; size: number}>();
  featureCollection.features.forEach(feature => {
    if (feature.properties) {
      const keys = Object.keys(feature.properties);
      for (const key of keys) {
        const value = feature.properties[key];
        if (value) {
          const strValue = typeof value === 'string' ? value : value.toString();
          if (fields.has(key)) {
            const fieldDescription = fields.get(key);
            if (strValue.length > fieldDescription!.size)
              fieldDescription!.size = strValue.length;
          } else {
            fields.set(key, {type: FieldType.String, size: strValue.length});
          }
        }
      }
    }
  });
  const result: Array<IFieldDescription> = [];
  fields.forEach((value, key) => {
    result.push({
      name: key,
      ...value,
    });
  });
  return result;
};

export const dbfWrite = async (
  dbfWritable: Writable,
  featureCollection: FeatureCollection
) => {
  const fields = getFieldsDescriptions(featureCollection);
  const numRecords = featureCollection.features.length;
  const numFields = fields.length;

  const headerSize = 32 + numFields * 32 + 1;
  let recordSize = 1;
  fields.forEach(field => {
    recordSize += field.size;
  });

  const dbfBuffer: FileBuffer = [];

  const header = Buffer.alloc(32);
  header.writeUInt8(0x03, 0); // Version number
  const now = new Date();
  header.writeUInt8(now.getFullYear() - 1900, 1);
  header.writeUInt8(now.getMonth() + 1, 2);
  header.writeUInt8(now.getDate(), 3);
  header.writeUInt32LE(numRecords, 4);
  header.writeUInt16LE(headerSize, 8);
  header.writeUInt16LE(recordSize, 10);
  dbfBuffer.push(header);

  let fieldOffset = 1;
  fields.forEach(field => {
    const fieldDescriptor = Buffer.alloc(32);
    fieldDescriptor.write(field.name.slice(0, 10), 0);
    fieldDescriptor.writeUInt8(field.type.charCodeAt(0), 11);
    fieldDescriptor.writeUInt32LE(fieldOffset, 12);
    fieldDescriptor.writeUInt8(field.size, 16);
    dbfBuffer.push(fieldDescriptor);
    fieldOffset += field.size;
  });

  // Write terminator
  dbfBuffer.push(Buffer.from([0x0d]));

  for (const feature of featureCollection.features) {
    const record = Buffer.alloc(recordSize);
    let offset = 1; // Start after deletion flag
    record.writeUInt8(0x20, 0); // Not deleted

    fields.forEach(field => {
      const value = feature.properties?.[field.name];
      if (value !== undefined) {
        if (field.type === 'C') {
          record.write(String(value).slice(0, field.size), offset);
        }
      }
      offset += field.size;
    });
    dbfBuffer.push(record);
  }

  await writeToStream(dbfBuffer, dbfWritable);
};
