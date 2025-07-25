import {   METADATA_RAW_URL_TEMPLATE, METADATA_GITHUB_URL_TEMPLATE, L1_BYTECODE_RAW_URL_TEMPLATE, L2_BYTECODE_RAW_URL_TEMPLATE } from '@/config';


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
    const githubUrl = METADATA_GITHUB_URL_TEMPLATE.replace('{network}', network);
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
  const githubUrl = METADATA_RAW_URL_TEMPLATE.replace('{network}', network).replace('{address}', address);

  console.log('fetchGithubMetadataFromHtml githubUrl', githubUrl);
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



// Extracts the payload.tree.items array from the GitHub directory HTML page
export async function fetchL1BytecodeFromGithub(  contractName: string): Promise<any> {

  const githubUrl = L1_BYTECODE_RAW_URL_TEMPLATE.replace('{contractName}', contractName) ;

  // console.log('fetchBytecodeFromGithub githubUrl', githubUrl);
  try{
    const res = await fetch(githubUrl);
    const html = await res.text();
    // console.log('fetchBytecodeFromGithub html', html);

    // 1. <script type="application/json" data-target="react-app.embeddedData">...</script> 추출
    const scriptMatch = html.match(
      /<script type="application\/json" data-target="react-app\.embeddedData">([\s\S]*?)<\/script>/
    );
    if (!scriptMatch) throw new Error('embeddedData script not found');
    const jsonText = scriptMatch[1];
    const data = JSON.parse(jsonText);
    const rawLines = data?.payload?.blob?.rawLines;
    if (!Array.isArray(rawLines)) throw new Error('rawLines not found');
    // console.log('fetchBytecodeFromGithub rawLines', rawLines);

    // rawLines를 JSON 오브젝트로 파싱해서 반환
    try {
      return JSON.parse(rawLines.join('\n'));
    } catch (e) {
      return null;
    }
  } catch(e) {
    console.log('fetchBytecodeFromGithub error', e);
    return null;
  }

}



// Extracts the payload.tree.items array from the GitHub directory HTML page
export async function fetchL2BytecodeFromGithub( contractName: string): Promise<any> {

  const githubUrl = L2_BYTECODE_RAW_URL_TEMPLATE.replace('{contractName}', contractName) ;

  // console.log('fetchL2BytecodeFromGithub githubUrl', githubUrl);
  try{
    const res = await fetch(githubUrl);
    const html = await res.text();
    // 1. <script type="application/json" data-target="react-app.embeddedData">...</script> 추출
    const scriptMatch = html.match(
      /<script type="application\/json" data-target="react-app\.embeddedData">([\s\S]*?)<\/script>/
    );
    if (!scriptMatch) throw new Error('embeddedData script not found');
    const jsonText = scriptMatch[1];
    const data = JSON.parse(jsonText);
    const blob = data?.payload?.blob;
    // console.log('==== fetchL2BytecodeFromGithub DEBUG ====', contractName);
    // console.log('blob:', blob);
    // console.log('data.payload:', data?.payload);
    // console.log('data:', data);
    let jsonString: string | undefined;

    if (Array.isArray(blob?.rawLines)) {
      jsonString = blob.rawLines.join('\n');
    } else if (typeof blob?.text === 'string') {
      jsonString = blob.text;
    } else {
      throw new Error('Neither rawLines nor text found');
    }

    try {
      if (typeof jsonString === 'string') {
        return JSON.parse(jsonString);
      } else {
        return null;
      }
    } catch (e) {
      return null;
    }
  } catch(e) {
    console.log('fetchBytecodeFromGithub error', e);
    return null;
  }

}