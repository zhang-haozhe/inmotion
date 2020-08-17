from google.cloud import firestore

db = firestore.Client()
# [START quickstart_get_collection]
doc_ref = db.collection(u'Emotion').document(u'ex-husband.mp4').collection(u'0').document(u'data')

doc = doc_ref.get()
if doc.exists:
    print(f'Document data: {doc.to_dict()}')
else:
    print(u'No such document!')

# [END quickstart_get_collection]
