function makeid(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

dm = {
  logged_in: false,
  bio:{
    name: '',
    email: ''
  },
  data:{
    impressions: 0,
    spent: 0,
    credit: 0
  },
  creatives: {}
};

stock_images = [
  'http://ads.w55c.net/t/d/0_XoAvVfh3.jpg',
  'http://ads.w55c.net/t/d/0_Y9n4cdcS.jpg',
  'http://ads.w55c.net/t/d/0_U8iHPAVH.jpg',
	'http://www.lamppost-backstreet.com/Pepperoni_Pizza.jpg',
	'http://villalucias.com/images/g-081126-hlt-pizza-1111a.grid-6x2.jpg'
];

(function($){

  $(document).ready(function(){
    set_ui_bindings();
    if (!has_content()){
      show_creative_prompt();
    }
    setInterval(simulate_spend, 1500);
  });

  var set_ui_bindings = function(){

     $('form').submit(function(){
      return false;
     });

     $('#form-register').submit(function(e){
      var name = $('input[name=inputName]', this).val();
      var email = $('input[name=inputEmail]', this).val();
      dm.logged_in = true;
      dm.bio.name = name;
      dm.bio.email = email;
      $('#set-up').modal('hide');
      refresh_ui();
     });

     $('#form-value').submit(function(e){
      var amount = parseInt($('input[name=inputAmount]', this).val(), 10);
      if (amount){
        dm.data.credit += parseInt($('input[name=inputAmount]', this).val(), 10);
        $('#add-value').modal('hide');
      }
     });

     $('#new-ad').on('show', function(){
		add_images(stock_images, true);
    });

	$('#add-image').submit(function(e){
		var url = $('input[name=inputURL]').val();
		add_images([url], false);
		stock_images.push(url);
	});
   };
  
  	var add_images = function(image_list, clear_first){
		var cols = [$('#new-ad .col1'), $('#new-ad .col2'), $('#new-ad .col3')];
		if (clear_first === true){
			$('#new-ad .span3').empty();
		}

		var get_shortest = function(){
		  var hit = 0;
		  var i = 0;
		  var selected = cols[0];
		  var min = $(selected).height();
		  if (min === 0){
		    return selected;
		  }

		  while (hit < 3){
		    e_i = i % cols.length;
		    hit++;
		    i++;
		    var height = $(cols[e_i]).height();
		    if ( height < min){
		      selected = cols[e_i];
		      min = height;
		      hit = 0;
		    }
		  }
		  return selected;
		};
		var i = 0;
		var interval;
		var add_img = function(){
		  if (i < image_list.length){
		    $("<a href='#' class='thumbnail'><img src='"+ image_list[i] +"'/></a>").appendTo(get_shortest()).click(function(){
		      var img = $('img', this).attr('src');
		      set_up_creative(img);
		      $('#new-ad .span3').empty();
		      $('#new-ad').modal('hide');
		      return false;
		    });
		  }else{
		    clearInterval(interval);
		  }
		  i++;
		};
		interval = setInterval(add_img, 100);
	};

   var show_creative_prompt = function(){
    $('#new-ad').modal();
   };

   var has_content = function(){
    return Object.keys(dm.creatives).length > 0;
   };

   var refresh_ui = function(){
    var refresh_interval;
    if (dm.logged_in){
      $('#auth-bar').show();
      $('#auth-bar .brand').text(dm.bio.name);
      refresh_interval = setInterval(function(){
        console.log(dm.data);
        $('.value-impressions').text(parseInt(dm.data.impressions, 10));
        $('.value-spent').text((dm.data.spent).toFixed(2));
        $('.value-credit').text((dm.data.credit).toFixed(2));
      }, 500);
    }else{
      $('#auth-bar').hide();
      clearInterval(refresh_interval);
    }
   };

   var set_up_creative = function(img_src){
    var id = makeid();
    var temp = $($('.dx-creative-row.template')[0]).clone();
    $(temp).removeClass('hide template');
    $(temp).attr('id', id);
    $('.creative-img', temp).attr({src: img_src});
    $(temp).appendTo('#creative-table').click(function(){
       if (!$(this).hasClass('open')){
         $('.media').removeClass('open');
         $(this).addClass('open');
       }
     });
	
	var graph = new Rickshaw.Graph({
	    series: [{ 
			data: [{ x: 0, y: 2 }, { x: 1, y: 4 }, { x: 2, y: 5 }, { x: 3, y: 8 }, { x: 4, y: 7 }, { x: 5, y: 9 } ],
			color: 'steelblue'
			}],
	    renderer: 'line',
	    element: document.querySelector('#'+ id +' .performance-graph')
	});
	graph.render();
    $('.dx-start-creative', temp).click(function(e){
      e.stopPropagation();
      if (dm.logged_in === true && dm.data.credit > 0){
        if ($(this).hasClass('btn-success')){
          dm.creatives[id].status = false;
          $(this).removeClass('btn-success');
        }else{
          dm.creatives[id].status = true;
          $(this).addClass('btn-success');
        }
      }else{
        alert('Please log in and add value to your account');
      }

    });
    dm.creatives[id] = {id: id, src: img_src, spent: 0, impressions: 0, clicks: 0, status: false};
   };

   var simulate_spend = function(){
    var running_creatives = [];
    if (dm.data.credit > 0){
      for (var i in dm.creatives){
        var creative = dm.creatives[i];
        if (creative.status === true){
          var creative_elem = $('#' + creative.id);
		  var impressions = parseInt(Math.random() * 3, 10);
          var spend_amount = impressions * (.0060 + (Math.random() - 0.5) / 200);
          var clicks = 0;
          if (Math.random() > 0.8){
            clicks = 1;
          }
          creative.impressions += parseInt(impressions, 10);
          creative.spent += spend_amount;
          creative.clicks += clicks;
          $('.value-creative-impressions', creative_elem).text(creative.impressions);
          $('.value-creative-spent', creative_elem).text((creative.spent).toFixed(2));
          $('.value-creative-clicks', creative_elem).text(creative.clicks);
          dm.data.credit = dm.data.credit - spend_amount;
          dm.data.impressions = dm.data.impressions + impressions;
          dm.data.spent = dm.data.spent + spend_amount;
          console.log('spend');
        }
      }
    }else{
      $('.dx-start-creative').removeClass('btn-success');
    }
   };

})(jQuery);
