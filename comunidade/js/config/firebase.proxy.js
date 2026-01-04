// Acessa a variável global injetada pelo CDN no HTML
export const getFirebase = () => {
    if (typeof window.firebase === 'undefined') {
        console.error("Firebase SDK não carregado. Verifique os scripts no HTML.");
        throw new Error("Firebase SDK missing");
    }
    return window.firebase;
};

// Exporta atalhos prontos para uso em outros arquivos
export const db = () => getFirebase().firestore();
export const auth = () => getFirebase().auth();
export const serverTimestamp = () => getFirebase().firestore.FieldValue.serverTimestamp();
export const arrayUnion = (val) => getFirebase().firestore.FieldValue.arrayUnion(val);
export const arrayRemove = (val) => getFirebase().firestore.FieldValue.arrayRemove(val);
export const increment = (val) => getFirebase().firestore.FieldValue.increment(val);