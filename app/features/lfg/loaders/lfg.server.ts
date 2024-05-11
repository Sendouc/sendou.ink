import * as LFGRepository from "../LFGRepository.server";

export const loader = async (/*{}: LoaderFunctionArgs*/) => {
  return {
    posts: await LFGRepository.posts(),
  };
};
