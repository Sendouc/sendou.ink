import * as LFGRepository from "../LFGRepository.server";

// xxx: skills
export const loader = async (/*{}: LoaderFunctionArgs*/) => {
  return {
    posts: await LFGRepository.posts(),
  };
};
