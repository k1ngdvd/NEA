function initReplies(board, postId, currentUserId){
    const container = document.getElementById('replies-list');
    if(!container) return;

    async function fetchReplies(){
        try{
            const resp = await fetch(`/replies/${board}/${postId}`);
            if(!resp.ok) return;
            const data = await resp.json();

            container.innerHTML = '';

            if(!data || data.length === 0){
                const empty = document.createElement('div');
                empty.className = 'vp-empty';
                empty.textContent = 'No replies yet. Be the first to reply.';
                container.appendChild(empty);
                return;
            }

            data.forEach(r => {
                // Outer card
                const reply = document.createElement('article');
                reply.className = 'vp-reply';

                // Header
                const head = document.createElement('div');
                head.className = 'vp-reply-head';

                // Avatar
                const avatar = document.createElement('div');
                avatar.className = 'vp-avatar';
                const first = (r.firstname || '').trim();
                const last  = (r.surname || '').trim();
                avatar.textContent = (first ? first.charAt(0) : (last ? last.charAt(0) : '?'));
                head.appendChild(avatar);

                // Meta block
                const info = document.createElement('div');
                info.className = 'vp-reply-info';

                const author = document.createElement('div');
                author.className = 'vp-author';
                author.textContent = (first || last) ? `${first} ${last}`.trim() : 'Unknown';
                info.appendChild(author);

                const time = document.createElement('div');
                time.className = 'vp-time';
                time.textContent = `${r.date} • ${r.time}`;
                info.appendChild(time);

                head.appendChild(info);

                // Delete button (only if owned by current user)
                if (currentUserId && r.teacher_id === currentUserId){
                    const delForm = document.createElement('div');
                    delForm.className = 'vp-del-form';

                    const delBtn = document.createElement('button');
                    delBtn.type = 'button';
                    delBtn.className = 'vp-del';
                    delBtn.textContent = 'Delete';

                    delBtn.onclick = async function(e){
                        e.preventDefault();
                        if(!confirm('Delete this reply?')) return;
                        delBtn.disabled = true;

                        try{
                            const res = await fetch(`/delete_reply/${board}/${postId}/${r.reply_id}`, {
                                method: 'POST',
                                headers: {'X-Requested-With': 'XMLHttpRequest'}
                            });

                            if(res.ok){
                                fetchReplies();
                            }else{
                                console.error('Delete failed');
                                delBtn.disabled = false;
                            }
                        }catch(err){
                            console.error('Delete error', err);
                            delBtn.disabled = false;
                        }
                    };

                    delForm.appendChild(delBtn);
                    head.appendChild(delForm);
                }

                reply.appendChild(head);

                // Body (IMPORTANT: preserve newlines)
                const body = document.createElement('div');
                body.className = 'vp-reply-body';
                body.textContent = r.content || '';
                reply.appendChild(body);

                container.appendChild(reply);
            });

        }catch(e){
            console.error('fetchReplies error', e);
        }
    }

    fetchReplies();
    setInterval(fetchReplies, 10000);
}