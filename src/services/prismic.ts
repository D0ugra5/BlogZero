import * as prismic from '@prismicio/client';
import { HttpRequestLike } from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';

export interface PrismicConfig {
  req?: HttpRequestLike;
}

export function getPrismicClient(config: PrismicConfig): prismic.Client {
  const client = prismic.createClient('Blogzero', {
    accessToken: process.env.PRISMIC_API_ENDPOINT,
  });

  enableAutoPreviews({
    req: config.req,
    client,
  });

  return client;
}
