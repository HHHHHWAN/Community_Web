// utils/re_structure.js

// 데이터 트리구조 생성
exports.comment_structure = (Comments, parentId = null) => {
    const comments_tree = [];
    Comments
        .filter( comment => comment.parent_id === parentId )
        .forEach( comment => {
            const children = exports.comment_structure(Comments, comment.id);
            comments_tree.push({...comment,children});
        });

    return comments_tree;
};