(() => {
    const STORAGE_KEY = 'mas_feedback_items_v1';

    window.addEventListener('DOMContentLoaded', () => {
        const form = document.querySelector('#feedback-form');
        const list = document.querySelector('#feedback-list');
        const template = document.querySelector('#feedback-item-template');

        if (!form || !list || !template) return;

        let items = loadItems();
        renderAll(items, list, template);

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const nameInput = form.elements['name'];
            const commentInput = form.elements['comment'];

            const name = nameInput.value.trim();
            const comment = commentInput.value.trim();

            if (name.length < 2) {
                alert('Имя должно содержать минимум 2 символа.');
                return;
            }
            if (comment.length < 5) {
                alert('Отзыв должен меть минимум 5 символов.');
                return;
            }

            const newItem = {
                id: Date.now().toString(),
                name,
                comment
            };

            items.push(newItem);
            saveItems(items);

            appendItem(newItem, list, template);
            form.reset();
        });

        list.addEventListener('click', (event) => {
            const deleteBtn = event.target.closest('.feedback-item__delete-btn');
            if (deleteBtn) {
                const article = deleteBtn.closest('.feedback-item');
                if (!article) return;

                const id = article.dataset.id;

                items = items.filter((it) => it.id !== id);
                saveItems(items);
                article.remove();
                return;
            }

            const editBtn = event.target.closest('.feedback-item__edit-btn');
            if (!editBtn) return;

            const article = editBtn.closest('.feedback-item');
            if (!article) return;

            const id = article.dataset.id;
            const item = items.find((it) => it.id === id);
            if (!item) return;

            const commentEl = article.querySelector('.feedback-item__comment');
            if (!commentEl) return;

            const isEditing = article.classList.contains('editing');

            if (!isEditing) {
                article.classList.add('editing');
                commentEl.contentEditable = 'true';
                commentEl.focus();
                editBtn.textContent = 'Сохранить';
            } else {
                const newComment = commentEl.textContent.trim();

                if (newComment.length < 5) {
                    alert('Отзыв слишком короткий.');
                    return;
                }
                if (newComment.length > 400) {
                    alert('Отзыв слишком длинный.');
                    return;
                }

                item.comment = newComment;
                saveItems(items);

                commentEl.contentEditable = 'false';
                article.classList.remove('editing');
                editBtn.textContent = 'Изменить';
            }
        });

    });


    function loadItems() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Ошибка чтения из localStorage', e);
            return [];
        }
    }

    function saveItems(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            console.error('Ошибка сохранения в localStorage', e);
        }
    }

    function renderAll(items, list, template) {
        list.innerHTML = '';
        items.forEach((item) => appendItem(item, list, template));
    }

    function appendItem(item, list, template) {
        const fragment = template.content.cloneNode(true);
        const article = fragment.querySelector('.feedback-item');
        const nameEl = fragment.querySelector('.feedback-item__name');
        const commentEl = fragment.querySelector('.feedback-item__comment');

        article.dataset.id = item.id;
        nameEl.textContent = item.name;
        commentEl.textContent = item.comment;

        list.prepend(fragment);
    }
})();
