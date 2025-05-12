async function upsertToFirestore(collectionRef, item) {
    const { id, ...safeItem } = item;
    const querySnapshot = await collectionRef.where('name', '==', item.name).get();

    if (!querySnapshot.empty) {
        const existingDoc = querySnapshot.docs[0];
        await existingDoc.ref.set(safeItem, { merge: true });
        return { status: 'updated', name: item.name };
    } else {
        await collectionRef.add(safeItem);
        return { status: 'added', name: item.name };
    }
}

async function addIfNotExists(collectionRef, item) {
    const { id, ...safeItem } = item;
    const querySnapshot = await collectionRef.where('name', '==', item.name).get();

    if (querySnapshot.empty) {
        await collectionRef.add(safeItem);
        return { status: 'added', name: item.name };
    } else {
        return { status: 'skipped', name: item.name };
    }
}

function removeUndefinedFields(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));
}

module.exports = {
    upsertToFirestore,
    addIfNotExists,
    removeUndefinedFields
};
