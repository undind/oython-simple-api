const ns = {};

// Create the model instance
ns.model = (function() {

    return {
        read: () => {
            const ajax_options = {
                type: 'GET',
                url: '/api/notes',
                accepts: 'application/json',
                dataType: 'json'
            };

            return $.ajax(ajax_options)
        }
    }

}());

// Create the view instance
ns.view = (function() {

    let table = $('.blog table');

    return {
        build_table: (data) => {
            let source = $('#blog-table-template').html();
            let template = Handlebars.compile(source);
            let html = template({ notes: data });

            table.append(html);
        }
    }

}());

// Create the controller
ns.controller = (function(m, v) {

    let model = m;
    let view = v;

    setTimeout(() => {
        model.read()
            .done(data => {
                view.build_table(data);
            })
            .fail((xhr, textStatus, errorThrow) => {
                error_handler(xhr, textStatus, errorThrow)
            })
    }, 0);
    
    function error_handler(xhr, textStatus, errorThrow) {
        let errorsMessage = `${textStatus}: ${errorThrow} - ${xhr.responseJSON.detail}`;

        view.error(errorsMessage);
    }

    $('table').on('dblclick', 'tbody td.name', e => {
        let target = $(e.target).parent();
        let personId = target.data('person_id')

        window.location = `/people/${personId}`;
    })

    $('table').on('dblclick', 'tbody td.content', e => {
        let target = $(e.target).parent();
        let personId = target.data('person_id');
        let noteId = target.data('note_id')

        window.location = `/people/${personId}/notes/${noteId}`;
    })

}(ns.model, ns.view));