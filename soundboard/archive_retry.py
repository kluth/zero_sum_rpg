import urllib.request
import json
import urllib.parse
import os

os.makedirs('audio', exist_ok=True)

search_plans = {
    'chant_china.mp3': [
        'hong kong protest',
        'chinese crowd',
        'china crowd',
        'beijing protest'
    ],
    'chant_russia.mp3': [
        'russian crowd',
        'moscow crowd',
        'russian protest',
        'soviet crowd'
    ]
}

def search_and_download():
    for filename, queries in search_plans.items():
        if os.path.exists(f"audio/{filename}"):
            print(f"File {filename} already exists, skipping.")
            continue
            
        success = False
        for query in queries:
            if success:
                break
                
            print(f"Searching Archive.org for {query}...")
            search_query = f'mediatype:audio AND "{query}"'
            url = f'https://archive.org/advancedsearch.php?q={urllib.parse.quote(search_query)}&fl[]=identifier&sort[]=downloads+desc&rows=10&output=json'
            
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'ZeroSumBot/7.0'})
                with urllib.request.urlopen(req) as resp:
                    data = json.loads(resp.read())
                    
                docs = data['response']['docs']
                for doc in docs:
                    identifier = doc['identifier']
                    print(f"Trying identifier: {identifier}")
                    
                    files_url = f"https://archive.org/metadata/{identifier}/files"
                    try:
                        with urllib.request.urlopen(urllib.request.Request(files_url, headers={'User-Agent': 'ZeroSumBot/7.0'})) as f_resp:
                            files_data = json.loads(f_resp.read())
                            
                            mp3_file = next((f for f in files_data['result'] if f['name'].endswith('.mp3')), None)
                            if mp3_file:
                                download_url = f"https://archive.org/download/{identifier}/{urllib.parse.quote(mp3_file['name'])}"
                                print(f"Downloading {download_url} to {filename}...")
                                
                                with urllib.request.urlopen(urllib.request.Request(download_url, headers={'User-Agent': 'ZeroSumBot/7.0'})) as audio_req:
                                    with open(f"audio/{filename}", "wb") as out:
                                        out.write(audio_req.read())
                                print(f"Success! Downloaded {filename}.")
                                success = True
                                break
                    except Exception as e:
                        print(f"Failed to fetch files for {identifier}: {e}")
            except Exception as e:
                print(f"Error on query '{query}': {e}")
                
        if not success:
            print(f"COULD NOT FIND ANY MP3 FOR {filename} IN ARCHIVE.ORG")

if __name__ == '__main__':
    search_and_download()
