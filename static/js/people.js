const ns = {};

ns.model = (function() {

    return {
        read: () => {
            const ajax_options = {
                type: "GET",
                url: "/api/people",
                accept: "application/json",
                dataType: "json"
            };

            return $.ajax(ajax_options);
        },
        read_one: person_id => {
            const ajax_options = {
                type: "GET",
                url: `/api/people/${person_id}`,
                accept: "application/json",
                dataType: "json"
            };

            return $.ajax(ajax_options);
        },
        create: person => {
            const ajax_options = {
                type: "POST",
                url: "/api/people",
                accept: "application/json",
                contentType: 'application/json',
                dataType: "json",
                data: JSON.stringify(person)
            };

            return $.ajax(ajax_options)
        },
        update: person => {
            const ajax_options = {
                type: "PUT",
                url: `/api/people/${person.person_id}`,
                accept: "application/json",
                contentType: 'application/json',
                dataType: "json",
                data: JSON.stringify(person)
            };

            return $.ajax(ajax_options)
        },
        delete: person_id => {
            const ajax_options = {
                type: "DELETE",
                url: `/api/people/${person_id}`,
                accept: "application/json",
                contentType: 'plain/text'
            };

            return $.ajax(ajax_options)
        }
    }

}());

ns.view = (function() {

    const NEW_NOTE = 0;
    const EXISTING_NOTE = 1;

    let person_id = $('#person_id');
    let fname = $('#fname');
    let lname = $('#lname');
    let $create = $('#create');
    let $update = $('#update');
    let $delete = $('#delete');
    let $reset = $('#reset');

    return {
        NEW_NOTE: NEW_NOTE,
        EXISTING_NOTE: EXISTING_NOTE,

        reset: () => {
          person_id.text('');
          lname.val('');
          fname.val('').focus();
        },
        update_editor: (person) => {
            person_id.text(person.person_id);
            lname.val(person.lname);
            fname.val(person.fname).focus();
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
        build_table: (people) => {
            let source = $('#people-table-template').html();
            let template = Handlebars.compile(source);
            let html;

            $('.people table > tbody').empty();

            if (people) {
                html = template({ people });
                $('table').append(html);
            }
        },
        error: (errorMessage) => {
            $('.error').text(errorMessage).css('visibility', 'visible');
            setTimeout(() => {
                $('.error').fadeOut();
            }, 3000)
        }
    }

}());


ns.controller = (function(m, v) {
    let model = m;
    let view = v;
    let url_person_id = $('#url_person_id');
    let $person_id = $('#person_id');
    let $fname = $('#fname');
    let $lname = $('#lname');

    setTimeout(() => {
        view.reset();
        model.read()
            .done(data => {
                view.build_table(data);
            })
            .fail((xhr, textStatus, errorThrow) => {
                error_handler(xhr, textStatus, errorThrow)
            });

        if (url_person_id.val() !== '') {
            model.read_one(parseInt(url_person_id.val()))
                .done((data) => {
                    view.update_editor(data);
                    view.set_button_state(view.EXISTING_NOTE);
                })
                .fail((xhr, textStatus, errorThrow) => {
                    error_handler(xhr, textStatus, errorThrow)
                })
        }
    }, 0);

    function error_handler(xhr, textStatus, errorThrow) {
        let errorsMessage = `${textStatus}: ${errorThrow} - ${xhr.responseJSON.detail}`;

        view.error(errorsMessage);
    };

    view.set_button_state(view.NEW_NOTE);

    function validate(fname, lname) {
        return fname !== "" && lname !== "";
    };

    $('#create').click(e => {
        let fname = $fname.val();
        let lname = $lname.val();

        e.preventDefault();

        if (validate(fname, lname)) {
             model.create({
                'fname': fname,
                'lname': lname
            })
                .done(data => {
                    model.read()
                        .done(data => {
                            view.build_table(data)
                        })
                        .fail((xhr, textStatus, errorThrown) => {
                            error_handler(xhr, textStatus, errorThrown)
                        });
                    view.set_button_state(view.NEW_NOTE);
                })
                .fail((xhr, textStatus, errorThrown) => {
                    error_handler(xhr, textStatus, errorThrown)
                });
            view.reset();
        } else {
            alert('Problem with first or last name input');
        }
    })

    $('#update').click(e => {
        let person_id = parseInt($person_id.text());
        let fname = $fname.val();
        let lname = $lname.val();

        e.preventDefault();

        if (validate(fname, lname)) {
            model.update({
                person_id: person_id,
                fname: fname,
                lname: lname,
            })
                .done(data => {
                    model.read()
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
                })

        } else {
            alert('Problem with first or last name input');
        }
    });

    $('#delete').click(e => {
        let person_id = parseInt($person_id.text());

        e.preventDefault();

        if (validate('placeholder', lname)) {
            model.delete(person_id)
                .done(data => {
                    model.read()
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

    $('#reset').click(() => {
        view.reset();
        view.set_button_state(view.NEW_NOTE);
    })

    $('table').on('click', 'tbody tr', e => {
        let target = $(e.target).parent();
        let person_id = target.data('person_id');
        let fname = target.data('fname');
        let lname = target.data('lname');

        view.update_editor({
            person_id: person_id,
            fname: fname,
            lname: lname,
        });

        view.set_button_state(view.EXISTING_NOTE);
    });

    $('table').on('dblclick', 'tbody tr', e => {
        let target = $(e.target);
        let person_id = target.parent().attr('data-person_id');

        window.location.href = `/people/${person_id}/notes`;

    });

}(ns.model, ns.view));