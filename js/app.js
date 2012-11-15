function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

dm = {
    logged_in: false,
    bio: {
        name: '',
        email: ''
    },
    data: {
        impressions: 0,
        spent: 0,
        credit: 0
    },
    creatives: {}
};

stock_images = [
    'http://tech4globe.com/wp-content/uploads/2012/03/helmet-camera4.jpg',
    'http://prtl.uhcl.edu/portal/pls/portal/docs/1/2141239.JPG',
    'http://cutexu.mobi/photos/photo4.jpg',
    'http://cutexu.mobi/photos/photo5.jpg',
    'http://cdn2.business2community.com/wp-content/uploads/2012/09/travel31.jpg',
    'http://ads.w55c.net/t/d/0_U8iHPAVH.jpg',
    'http://newsdepo.webatu.com/wp-content/uploads/2011/12/travel.jpg',
    'http://www.lamppost-backstreet.com/Pepperoni_Pizza.jpg',
    'http://villalucias.com/images/g-081126-hlt-pizza-1111a.grid-6x2.jpg',
    'http://www.ifun4free.com/Wallpaper/Images/Drinks/DRINKS_004-hi.jpg',
    'http://ads.w55c.net/t/d/0_Y9n4cdcS.jpg',
    'http://www.ifun4free.com/Wallpaper/Images/Drinks/DRINKS_001-lo.jpg',
    'http://cdn.iphonehacks.com/wp-content/uploads/2012/09/iphone5-front-back.jpg',
    'http://ads.w55c.net/t/d/0_XoAvVfh3.jpg'];

(function ($) {

    $(document).ready(function () {
        set_ui_bindings();
        if (!has_content()) {
            show_creative_prompt();
        }
        setInterval(simulate_spend, 800);
    });

    var set_ui_bindings = function () {

        $('form').submit(function () {
            return false;
        });

        $('#form-register').submit(function (e) {
            var name = $('input[name=inputName]', this).val();
            var email = $('input[name=inputEmail]', this).val();
            var website = $('input[name=inputSite]', this).val();
            dm.logged_in = true;
            dm.bio.name = name;
            dm.bio.email = email;
            dm.bio.website = website;
            $('.creative-img').parent('a').attr({
                'href': dm.bio.website,
                'target': '_blank'
            });
            $('.inputLandingPage').val(dm.bio.website);
            $('#set-up').modal('hide');
            refresh_ui();
        });

        $('#form-value').submit(function (e) {
            var amount = parseInt($('input[name=inputAmount]', this).val(), 10);
            if (amount) {
                dm.data.credit += parseInt($('input[name=inputAmount]', this).val(), 10);
                $('#add-value').modal('hide');
            }
        });

        $('#new-ad').on('show', function () {
            add_images(stock_images, true);
        });

        $('#add-image').submit(function (e) {
            var url = $('input[name=inputURL]').val();
            add_images([url], false);
            stock_images.push(url);
        });

        $('#set-up').on('hide', function () {
            if (dm.logged_in === true &&  dm.data.credit === 0) {
                $('#add-value').modal();
            }
        });

    };

    var add_images = function (image_list, clear_first) {
        var cols = [$('#new-ad .col1'), $('#new-ad .col2'), $('#new-ad .col3')];
        if (clear_first === true) {
            $('#new-ad .span3').empty();
        }

        var get_shortest = function () {
            var hit = 0;
            var i = 0;
            var selected = cols[0];
            var min = $(selected).height();
            if (min === 0) {
                return selected;
            }

            while (hit < 3) {
                e_i = i % cols.length;
                hit++;
                i++;
                var height = $(cols[e_i]).height();
                if (height < min) {
                    selected = cols[e_i];
                    min = height;
                    hit = 0;
                }
            }
            return selected;
        };
        var i = 0;
        var interval;
        var add_img = function () {
            if (i < image_list.length) {
                $("<a href='#' class='thumbnail'><img src='" + image_list[i] + "'/></a>").appendTo(get_shortest()).click(function () {
                    var img = $('img', this).attr('src');
                    set_up_creative(img);
                    $('#new-ad .span3').empty();
                    $('#new-ad').modal('hide');
                    return false;
                });
            } else {
                clearInterval(interval);
            }
            i++;
        };
        interval = setInterval(add_img, 100);
    };

    var show_creative_prompt = function () {
        $('#new-ad').modal();
    };

    var has_content = function () {
        return Object.keys(dm.creatives).length > 0;
    };

    var refresh_ui = function () {
        var refresh_interval;
        if (dm.logged_in) {
            $('#auth-bar').show();
            $('#auth-bar .brand').text(dm.bio.name);
            refresh_interval = setInterval(function () {
                console.log(dm.data);
                $('.value-impressions').text(parseInt(dm.data.impressions, 10));
                $('.value-spent').text((dm.data.spent).toFixed(2));
                $('.value-credit').text((dm.data.credit).toFixed(2));
            }, 500);
        } else {
            $('#auth-bar').hide();
            clearInterval(refresh_interval);
        }
    };

    var set_up_creative = function (img_src) {
        var id = makeid();
        var temp = $($('.dx-creative-row.template')[0]).clone();
        $(temp).removeClass('hide template');
        $(temp).attr('id', id);
        $('.creative-img', temp).attr({
            src: img_src
        });
        $('.creative-img', temp).parent('a').attr({
            'href': dm.bio.website,
            'target': '_blank'
        });
        $(temp).appendTo('#creative-table').click(function () {
            if (!$(this).hasClass('open')) {
                $('.media').removeClass('open');
                $(this).addClass('open');
            }
        });
        setTimeout(function () {
            var seriesData = [];

            show_graph(id, seriesData);

        }, 500);

        $('.dx-start-creative', temp).click(function (e) {
            e.stopPropagation();
            if (dm.logged_in === true && dm.data.credit > 0) {
                if ($(this).hasClass('btn-success')) {
                    dm.creatives[id].status = false;
                    $(this).removeClass('btn-success');
                } else {
                    dm.creatives[id].status = true;
                    $(this).addClass('btn-success');
                }
            } else {
                $('#set-up').modal();
            }

        });

        $('.dx-min-creative', temp).click(function(e){
          $('#' + id).removeClass('open');
          e.stopPropagation();
        });

        $('.inputEndDate').datepicker({
            onSelect: function (text) {
                $('.inputEndDate', temp).val(text);
            },
            minDate: 0
        });

        dm.creatives[id] = {
            id: id,
            src: img_src,
            spent: 0,
            impressions: 0,
            clicks: 0,
            status: false,
            data: []
        };
    };

    var show_graph = function(id, data){
      seriesData = [];
      for (var i = 0; i < data.length; i++) {
          seriesData.push({
              x: i,
              y: data[i]
          });
      }
      if (seriesData.length === 0){
        seriesData.push({x:0,y:0});
      }
      console.log(seriesData);
      $('#' + id + ' .performance-graph').empty();
      var graph = new Rickshaw.Graph({
          series: [{
              data: seriesData,
              color: 'steelblue',
              name: "CPM"
          }],
          renderer: 'line',
          width: 620,
          height: 150,
          element: document.querySelector('#' + id + ' .performance-graph')
      });

      graph.render();

      var time = new Rickshaw.Fixtures.Time();
      var days = time.unit('day');


      var hoverDetail = new Rickshaw.Graph.HoverDetail({
          graph: graph,
          xFormatter: function (x) {
              return Date.today().add(x).minutes().toString("M/d/yyyy HH:mm");
          },
          yFormatter: function (y) {
              return (y).toFixed(2) + " CPM";
          }
      });

      var yAxis = new Rickshaw.Graph.Axis.Y({
          graph: graph
      });

      yAxis.render();

      var xAxis = new Rickshaw.Graph.Axis.Time({
          graph: graph,
          timeUnit: days
      });

      xAxis.render();
    };

    var simulate_spend = function () {
        var running_creatives = [];
        if (dm.data.credit > 0) {
            for (var i in dm.creatives) {
                var creative = dm.creatives[i];
                if (creative.status === true) {
                    var creative_elem = $('#' + creative.id);
                    var impressions = parseInt(Math.random() * 3, 10);
                    var spend_amount = impressions * Math.abs(0.0060 + (Math.random() - 0.5) / 300);
                    var clicks = 0;
                    if (Math.random() > 0.8) {
                        clicks = 1;
                    }
                    creative.impressions += parseInt(impressions, 10);
                    creative.spent += spend_amount;
                    creative.clicks += clicks;
                    creative.data.push(spend_amount);
                    show_graph(creative.id, creative.data);
                    $('.value-creative-impressions', creative_elem).text(creative.impressions);
                    $('.value-creative-spent', creative_elem).text((creative.spent).toFixed(2));
                    $('.value-creative-clicks', creative_elem).text(creative.clicks);
                    dm.data.credit = dm.data.credit - spend_amount;
                    dm.data.impressions = dm.data.impressions + impressions;
                    dm.data.spent = dm.data.spent + spend_amount;
                    console.log('spend');
                }
            }
        } else {
            $('.dx-start-creative').removeClass('btn-success');
        }
    };

})(jQuery);