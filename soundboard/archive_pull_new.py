import urllib.request
import json
import urllib.parse
import os

queries = {
    'burner_ring.mp3': 'cell phone ring',
    'imsi_catch.mp3': 'modem dial',
    'suppressed_shot.mp3': 'silenced gun',
    'police_sirens.mp3': 'police siren',
    'system_compromise.mp3': 'error beep',
    'burn_tie.mp3': 'paper shredder'
}

for filename, query in queries.items():
    print(f"Searching Archive.org for {query}...")
    search_query = f'mediatype:audio AND "{query}"'
    url = f'https://archive.org/advancedsearch.php?q={urllib.parse.quote(search_query)}&fl[]=identifier&sort[]=downloads+desc&rows=5&output=json'
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'ZeroSumBot/4.0'})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read())
            
        docs = data['response']['docs']
        if docs:
            identifier = docs[0]['identifier']
            print(f"Found identifier: {identifier}")
            
            files_url = f"https://archive.org/metadata/{identifier}/files"
            with urllib.request.urlopen(urllib.request.Request(files_url, headers={'User-Agent': 'ZeroSumBot/4.0'})) as f_resp:
                files_data = json.loads(f_resp.read())
                
                mp3_file = next((f for f in files_data['result'] if f['name'].endswith('.mp3')), None)
                if mp3_file:
                    download_url = f"https://archive.org/download/{identifier}/{urllib.parse.quote(mp3_file['name'])}"
                    print(f"Downloading {download_url} to {filename}...")
                    
                    with urllib.request.urlopen(urllib.request.Request(download_url, headers={'User-Agent': 'ZeroSumBot/4.0'})) as audio_req:
                        with open(f"audio/{filename}", "wb") as out:
                            out.write(audio_req.read())
                    print("Success!")
                else:
                    print("No MP3 file found in the item.")
        else:
            print("No items found.")
    except Exception as e:
        print(f"Error: {e}")
