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
                url: "/api/people/${person_id}",
                accept: "application/json",
                dataType: "json"
            };

            return $.ajax(ajax_options);
        },
    }

}());

ns.view = (function() {

    return {
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
    console.log(url_person_id.val())

    setTimeout(() => {
        model.read()
            .done(data => {
                view.build_table(data);
            })
            .fail((xhr, textStatus, errorThrow) => {
                error_handler(xhr, textStatus, errorThrow)
            })

        if (url_person_id.val() !== '') {
            model.read_one(parseInt(url_person_id.val()))
                .done((data) => {
                    console.log(data)
                })
                .fail((xhr, textStatus, errorThrow) => {
                    error_handler(xhr, textStatus, errorThrow)
                })
        }
    }, 0);

    function error_handler(xhr, textStatus, errorThrow) {
        let errorsMessage = `${textStatus}: ${errorThrow} - ${xhr.responseJSON.detail}`;

        view.error(errorsMessage);
    }

}(ns.model, ns.view));