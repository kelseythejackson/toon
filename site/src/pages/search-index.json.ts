// /search-index.json: the API names and pages the search dialog answers directly. See ../searchIndex.ts.
import type { APIRoute } from 'astro';
import { searchIndex } from '../searchIndex';

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await searchIndex()), { headers: { 'Content-Type': 'application/json' } });
