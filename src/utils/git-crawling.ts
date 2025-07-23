import { config } from '@/config';


export async function fetchAllMetadata(network: string): Promise<any[]> {
    //fetchGithubDirItemsFromHtml  함수로 목록을 가져와서, 각 주소에 대해 내용을 fetchGithubMetadataFromHtml 함수로 가져온다.
    const items = await fetchGithubDirItemsFromHtml(network);
    // console.log('fetchAllMetadata items', items, network);
    if(items.length === 0) {
        return [];
    }

    // 병렬로 가져오지 말고 순차적으로 가져오자
    let allMetadata = [];
    for(const item of items) {
        const metadata = await fetchGithubMetadataFromHtml(network, item);
        // console.log('fetchAllMetadata metadata', metadata, network, item);
        allMetadata.push(metadata);
    }
    return allMetadata;
}


// Extracts the payload.tree.items array from the GitHub directory HTML page
export async function fetchGithubDirItemsFromHtml(network: string | null): Promise<string[]> {
    if (network === null) network = 'sepolia';
    const githubUrl = `https://github.com/tokamak-network/tokamak-rollup-metadata-repository/tree/main/data/${network}`;
    const res = await fetch(githubUrl);
    const html = await res.text();

    if(html.length === 0) {
        return [];
    }
    // Extract the <script type="application/json" data-target="react-app.embeddedData">...</script> content
    const scriptMatch = html.match(
      /<script type="application\/json" data-target="react-app\.embeddedData">([^<]+)<\/script>/
    );
    if (!scriptMatch) throw new Error('embeddedData script not found');
    const jsonText = scriptMatch[1];
    const data = JSON.parse(jsonText);
    const items = data?.payload?.tree?.items;
    // console.log('fetchGithubDirItemsFromHtml', items);

    if (!Array.isArray(items)) throw new Error('items array not found');
    // Return only file names without .json extension
    return items
      .filter((item: any) => item.contentType === 'file' && typeof item.name === 'string' && item.name.endsWith('.json'))
      .map((item: any) => item.name.replace(/\.json$/, ''));
  }


// Extracts the payload.tree.items array from the GitHub directory HTML page
export async function fetchGithubMetadataFromHtml(network: string, address: string): Promise<any> {
  const githubUrl = `https://github.com/tokamak-network/tokamak-rollup-metadata-repository/blob/main/data/${network}/${address}.json`;
  const res = await fetch(githubUrl);
  const html = await res.text();

  // Extract the <script type="application/json" data-target="react-app.embeddedData">...</script> content
  const scriptMatch = html.match(
    /<script type="application\/json" data-target="react-app\.embeddedData">([^<]+)<\/script>/
  );
  if (!scriptMatch) throw new Error('embeddedData script not found');
  const jsonText = scriptMatch[1];
  const data = JSON.parse(jsonText);
  const rawLines = data?.payload?.blob?.rawLines;
  if (!Array.isArray(rawLines)) throw new Error('rawLines not found');
  return parseRawLinesToObject(rawLines);
}

// Parse a rawLines array (from payload.blob.rawLines) into a JSON object
export function parseRawLinesToObject(rawLines: string[]): any {
  if (!Array.isArray(rawLines)) throw new Error('rawLines must be an array');
  const jsonString = rawLines.join('\n');
  // console.log('parseRawLinesToObject', jsonString);

  return JSON.parse(jsonString);
}
