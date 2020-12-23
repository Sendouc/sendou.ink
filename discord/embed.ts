// all text max 6000 characters

export interface EmbedArgs {
  // max 256 characters
  title: string;
  url: string;
  // max 2048 characters
  description?: string;
  rightImageSrc: string;
  // max 25 fields
  // name max 256
  // value max 1024
  fields: { name: string; value: string; inline?: true }[];
}

export type Embed = ReturnType<typeof getEmbed>;

const getEmbed = (args: EmbedArgs) => {
  return {
    title: args.title.substr(0, 256),
    url: args.url,
    description: args.description
      ? args.description.substr(0, 2048)
      : undefined,
    thumbnail: {
      url: args.rightImageSrc,
    },
    fields: args.fields.map((field) => ({
      ...field,
      name: field.name.substr(0, 256),
      value: field.value.substr(0, 1024),
    })),
    color: 7995233,
  };
};

export default getEmbed;
