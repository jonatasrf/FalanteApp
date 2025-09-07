import requests
import json
import os

# Sua chave da ElevenLabs (substitua pela sua)
API_KEY = "SUA_CHAVE_API"
BASE_URL = "https://api.elevenlabs.io/v1/text-to-speech/"

# Estrutura do diálogo
dialogo = [
    { "speaker": "Ana", "voice_id": "voz_ana_id", "text": "Oi Pedro, como está o tempo hoje?" },
    { "speaker": "Pedro", "voice_id": "voz_pedro_id", "text": "Está ensolarado, mas acho que vai chover à tarde." },
    { "speaker": "Ana", "voice_id": "voz_ana_id", "text": "Então é melhor levar um guarda-chuva." }
]

# Cabeçalhos para a requisição
headers = {
    "Accept": "audio/mpeg",
    "Content-Type": "application/json",
    "xi-api-key": API_KEY
}

# Pasta de saída
os.makedirs("audios", exist_ok=True)

# Gera os áudios
for i, fala in enumerate(dialogo, start=1):
    response = requests.post(
        f"{BASE_URL}{fala['voice_id']}",
        headers=headers,
        json={
            "text": fala["text"],
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.75
            }
        }
    )

    if response.status_code == 200:
        filename = f"audios/{i}_{fala['speaker']}.mp3"
        with open(filename, "wb") as f:
            f.write(response.content)
        print(f"✅ Áudio salvo: {filename}")
    else:
        print(f"❌ Erro: {response.status_code} - {response.text}")
