import { db } from '../firebase/firebase';
import { addDoc, collection } from '@firebase/firestore';

// Add the record to Firestore
export const addToFirestore = async (newData: any) => {
    try {
        const docRef = await addDoc(collection(db, "data-store"), newData);
        return docRef.id
    } catch (e) {
        console.error("Error: ", e);
        return false
    }
}