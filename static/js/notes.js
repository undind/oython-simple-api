const ns = {};

ns.model = (function(){
    return {
        read: person_id => {
            const ajax_options = {
                type: "GET",
                url: `/api/people/${person_id}`,
                accept: "application/json",
                dataType: "json"
            };

            return $.ajax(ajax_options);
        },
        read_one: (person_id, note_id) => {
            const ajax_options = {
                type: "GET",
                url: `/api/people/${person_id}/notes/${note_id}`,
                accept: "application/json",
                dataType: "json"
            };

            return $.ajax(ajax_options);
        },
        create: (person_id, note) => {
            const ajax_options = {
                type: "POST",
                url: `/api/people/${person_id}/notes`,
                accept: "application/json",
                contentType: 'application/json',
                dataType: "json",
                data: JSON.stringify(note)
            };

            return $.ajax(ajax_options)
        },
        update: (person_id, note) => {
            const ajax_options = {
                type: "PUT",
                url: `/api/people/${person_id}/notes/${note.note_id}`,
                accept: "application/json",
                contentType: 'application/json',
                dataType: "json",
                data: JSON.stringify(note)
            };

            return $.ajax(ajax_options)
        },
        delete: (person_id, note_id) => {
            const ajax_options = {
                type: "DELETE",
                url: `/api/people/${person_id}/notes/${note_id}`,
                accept: "application/json",
                contentType: 'plain/text'
            };

            return $.ajax(ajax_options)
        }
    }
}());

ns.view = (function(){
    const NEW_NOTE = 0;
    const EXISTING_NOTE = 1;

    let person_id = $('#person_id');
    let fname = $('#fname');
    let lname = $('#lname');
    let $timestamp = $('#timestamp');
    let $note_id = $('#note_id');
    let $note = $('#note');
    let $create = $('#create');
    let $update = $('#update');
    let $delete = $('#delete');

    return {
        NEW_NOTE: NEW_NOTE,
        EXISTING_NOTE: EXISTING_NOTE,
        reset: () => {
          $note_id.val('');
          $note.val('').focus();
        },
        update_editor: note => {
            $note_id.text(note.note_id);
            $note.val(note.content).focus();
        },
        set_button_state: state => {
            if (state === NEW_NOTE) {
                $create.prop('disabled', false);
                $update.prop('disabled', true);
                $delete.prop('disabled', true);
            } else if (state === EXISTING_NOTE) {
                $create.prop('disabled', true);
                $update.prop('disabled', false);
                $delete.prop('disabled', false);
            }
        },
        build_table: person => {
            let source = $('#notes-table-template').html();
            let template = Handlebars.compile(source);
            let html;

            person_id.text(person.person_id);
            fname.text(person.fname);
            lname.text(person.lname);
            $timestamp.text(person.timestamp);

            $('.notes table > tbody').empty();

            if (person.notes) {
                html = template({notes: person.notes});
                $('table').append(html);
            }
        },
        error: errorMessage => {
            $('.error')
                .text(errorMessage)
                .css('visibility', 'visible');
            setTimeout(function () {
                $('.error').fadeOut();
            }, 3000)
        }
    }
}());

ns.controller = (function(m, v){
    let model = m;
    let view = v;
    let url_person_id = $('#url_person_id');
    let url_note_id = $('#url_note_id');
    let $note_id = $('#note_id');
    let $note = $('#note');

    setTimeout(() => {
        view.reset();
        model.read(parseInt(url_person_id.val()))
            .done(data => {
                view.build_table(data);
                view.update_editor(data);
                view.set_button_state(view.NEW_NOTE);
            })
            .fail((xhr, textStatus, errorThrown) => {
                error_handler(xhr, textStatus, errorThrown);
            });

        if (url_note_id.val() !== "") {
            model.read_one(parseInt(url_person_id.val()), parseInt(url_note_id.val()))
                .done(data => {
                    view.update_editor(data);
                    view.set_button_state(view.EXISTING_NOTE);
                })
                .fail((xhr, textStatus, errorThrown) => {
                    error_handler(xhr, textStatus, errorThrown);
                });
        }
    }, 0)

    function error_handler(xhr, textStatus, errorThrow) {
        let errorsMessage = `${textStatus}: ${errorThrow} - ${xhr.responseJSON.detail}`;

        view.error(errorsMessage);
    }

    view.set_button_state(view.NEW_NOTE);

    function validate(note) {
        return note !== "";
    }

    $('#create').click(e => {
        let note = $note.val();

        e.preventDefault();

        if (validate(note)) {
            model.create(parseInt($('#url_person_id').val()), {
                content: note
            })
                .done(data => {
                    model.read(parseInt($('#url_person_id').val()))
                        .done(data => {
                            view.build_table(data);
                        })
                        .fail((xhr, textStatus, errorThrown) => {
                            error_handler(xhr, textStatus, errorThrown);
                        });
                    view.reset();
                    view.set_button_state(view.NEW_NOTE);
                })
                .fail((xhr, textStatus, errorThrown) => {
                    error_handler(xhr, textStatus, errorThrown);
                });

        } else {
            alert('Problem with note input');
        }
    });

    $('#update').click(e => {
        let person_id = parseInt(url_person_id.val());
        let note_id = parseInt($note_id.text());
        let note = $note.val();

        e.preventDefault();

        if (validate(note)) {
            model.update(person_id, {
                note_id: note_id,
                content: note
            })
                .done(data => {
                    model.read(data.person.person_id)
                        .done(data => {
                            view.build_table(data);
                        })
                        .fail((xhr, textStatus, errorThrown) => {
                            error_handler(xhr, textStatus, errorThrown);
                        });
                    view.reset();
                    view.set_button_state(view.NEW_NOTE);
                })
                .fail((xhr, textStatus, errorThrown) => {
                    error_handler(xhr, textStatus, errorThrown);
                });

        } else {
            alert('Problem with first or last name input');
        }
    });

    $('#delete').click(e => {
        let person_id = parseInt(url_person_id.val());
        let note_id = parseInt($note_id.text());

        e.preventDefault();

        if (validate('placeholder', lname)) {
            model.delete(person_id, note_id)
                .done(data => {
                    model.read(parseInt($('#url_person_id').val()))
                        .done(data => {
                            view.build_table(data);
                        })
                        .fail((xhr, textStatus, errorThrown) => {
                            error_handler(xhr, textStatus, errorThrown);
                        });
                    view.reset();
                    view.set_button_state(view.NEW_NOTE);
                })
                .fail( (xhr, textStatus, errorThrown) => {
                    error_handler(xhr, textStatus, errorThrown);
                });

        } else {
            alert('Problem with first or last name input');
        }
    });

    $('#reset').click(() => {
        view.reset();
        view.set_button_state(view.NEW_NOTE);
    })

    $('table').on('click', 'tbody tr', (e) => {
        let target = $(e.target).parent();
        let note_id = target.data('note_id');
        let content = target.data('content');

        view.update_editor({
            note_id: note_id,
            content: content,
        });
        view.set_button_state(view.EXISTING_NOTE);
    });
}(ns.model, ns.view));