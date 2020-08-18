from google.cloud import firestore
import json
import pandas as pd
import pdb
import os

credential_path = "D:\Git\inmotion\privatekey\inmotion-bd463-firebase-adminsdk-v5vxv-290d63bee8.json"
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = credential_path
db = firestore.Client()
# [START quickstart_get_collection]
doc_ref = db.collection(u'Emotion').document(
    u'ex-husband.mp4').collection(u'0').document(u'data')

doc = doc_ref.get()
if doc.exists:
    dic = doc.to_dict()
    print(f'Document data: {doc.to_dict()}')
else:
    print(u'No such document!')

docs = db.collection(u'Emotion').stream()
for doc in docs:
    print(f'{doc.id} => {doc.to_dict()}')

df = pd.DataFrame(columns=['happy', 'neutral', 'surprised',
                           'sad', 'angry', 'fearful', 'disgusted', 'timeFrame', 'video'])


for vid in db.collection(u'Emotion').stream():
    vid = vid.id
    count = 0
    while True:
        doc_ref = db.collection(u'Emotion').document(
            vid).collection(str(count)).document(u'data')
        doc = doc_ref.get()
        if not doc.exists:
            break
        print(doc.id, count)
        dic = doc.to_dict()
        for i in dic["detections"]:
            expressions = json.loads(i)
            expressions['video'] = vid
            df = df.append(expressions, ignore_index=True)
        count += 1

# [END quickstart_get_collection]

df.to_csv('expressions.csv')

pdb.set_trace()

# [END quickstart_get_collection]
