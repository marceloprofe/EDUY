"""Importación idempotente del catálogo EDUY. Ejecutar en Cloud Shell autorizado.

python3 importar-cursos-eduy.py cursos-iniciales.json
Solo crea IDs ausentes y agrega imagen a documentos que todavía no la tienen.
No modifica reglas, docentes ni el contenido de cursos existentes.
"""
import datetime
import json
import pathlib
import subprocess
import sys
import urllib.error
import urllib.request

PROJECT = "eduy-d6421"
ROOT = f"projects/{PROJECT}/databases/(default)/documents"
BASE = f"https://firestore.googleapis.com/v1/{ROOT}"

def encode(value):
    if isinstance(value, bool):
        return {"booleanValue": value}
    if isinstance(value, int):
        return {"integerValue": str(value)}
    if isinstance(value, str):
        return {"stringValue": value}
    if isinstance(value, list):
        return {"arrayValue": {"values": [encode(item) for item in value]}}
    if isinstance(value, dict):
        return {"mapValue": {"fields": {key: encode(item) for key, item in value.items()}}}
    raise ValueError(f"Tipo no admitido: {type(value)}")

def main():
    cursos = json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))
    assert len(cursos) == 15 and len({c['id'] for c in cursos}) == 15
    token = subprocess.check_output(["gcloud", "auth", "print-access-token"], text=True).strip()

    def request(suffix, body=None):
        req = urllib.request.Request(
            BASE + suffix,
            data=json.dumps(body, ensure_ascii=False).encode() if body is not None else None,
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.load(response)

    existentes = {}
    page = ""
    while True:
        resultado = request("/cursos?pageSize=100" + ("&pageToken=" + page if page else ""))
        for doc in resultado.get("documents", []):
            existentes[doc['name'].rsplit('/', 1)[1]] = doc
        page = resultado.get("nextPageToken", "")
        if not page:
            break

    writes = []
    creados = []
    imagenes = []
    now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
    for curso in cursos:
        curso = dict(curso)
        identificador = curso.pop('id')
        if identificador in existentes:
            continue
        fields = {key: encode(value) for key, value in curso.items()}
        fields['fechaCreacion'] = {'timestampValue': now}
        fields['fechaActualizacion'] = {'timestampValue': now}
        writes.append({'update': {'name': ROOT + '/cursos/' + identificador, 'fields': fields}, 'currentDocument': {'exists': False}})
        creados.append(identificador)

    for identificador, doc in existentes.items():
        fields = doc.get('fields', {})
        if fields.get('imagen', {}).get('stringValue', '').strip():
            continue
        titulo = fields.get('titulo', {}).get('stringValue', '').lower()
        imagen = 'img/logo.png'
        for tema in ['python', 'javascript', 'arduino', 'esp32', 'microbit', 'raspberry-pi', 'html-css']:
            if tema.replace('-', ' ') in titulo.replace(':', '').replace('-', ' '):
                imagen = 'img/cursos/curso-' + tema + '-eduy.jpg'
                break
        writes.append({'update': {'name': doc['name'], 'fields': {'imagen': encode(imagen)}}, 'updateMask': {'fieldPaths': ['imagen']}, 'currentDocument': {'updateTime': doc['updateTime']}})
        imagenes.append(identificador)

    if writes:
        request(':commit', {'writes': writes})
    print(json.dumps({'proyecto': PROJECT, 'creados': creados, 'imagenesAgregadas': imagenes, 'escrituras': len(writes)}, ensure_ascii=False))
    # Verificación posterior: cada ID original debe existir con imagen y cuatro módulos.
    for curso in cursos:
        doc = request('/cursos/' + curso['id'])
        fields = doc['fields']
        assert fields.get('imagen', {}).get('stringValue'), curso['id']
        assert fields.get('habilitado', {}).get('booleanValue') is True, curso['id']
        assert len(fields.get('modulos', {}).get('arrayValue', {}).get('values', [])) == 4, curso['id']
    print('VERIFICADO: 15 cursos originales disponibles desde Firestore con imagen y módulos.')

if __name__ == '__main__':
    try:
        main()
    except urllib.error.HTTPError as error:
        print('Error de Firestore:', error.code, error.read().decode(), file=sys.stderr)
        sys.exit(1)
