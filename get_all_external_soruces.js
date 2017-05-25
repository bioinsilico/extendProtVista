"use strict";

var listURL;
var $EXTERNAL_DATA = null;
var local_imported_flag = null;
var local_accession = null;
var local_alignment =  null;

function wait_message(message){
    if($j(".jsonp_info").length){
    $j('.jsonp_info').html("<div>"+message+"<br/>PLEASE WAIT<br/><br/><img src=\"/images/loading_em.gif\"/></div>");
  }else{
    $j('body').append("<div class=\"filter_screen\"></div><div class=\"jsonp_info\" ><div>"+message+"<br/>PLEASE WAIT<br/><br/><img src=\"/images/loading_em.gif\"/></div></div>");
  }
}

function clear_wm(){
  $j(".filter_screen").remove();
  $j(".jsonp_info").remove();
}

function get_external_data( URL, d ){
  var query = URL.shift();
  var url = query[1];
  var key = query[0];
  var save_flag = query[2];
  wait_message( "COLLECTING <span style=\"color:black\">"+key.toUpperCase()+"</span> "+(listURL.length-URL.length)+" / "+listURL.length );
  if( $EXTERNAL_DATA && key in $EXTERNAL_DATA['acc'] && local_alignment.uniprot in $EXTERNAL_DATA['acc'][key] ){
    d[key] = $EXTERNAL_DATA['acc'][key][local_alignment.uniprot];
    if(URL.length > 0){
      get_external_data( URL, d );
      return;
    }else{
      clear_wm();
      var key = local_alignment.pdb+":"+local_alignment.chain;
      if(local_imported_flag)key += ":"+local_accession;
      $EXTERNAL_DATA['PDBchain'][ key ] = d;
      build_ProtVista();
      return;
    }
  }else{
    $j.ajax({
      url: url,
      dataType: 'json',
      timeout:30000,
      success: function(data){
        d[key] = data;
        if( save_flag ){
          if(!$EXTERNAL_DATA['acc'][key])$EXTERNAL_DATA['acc'][key] = {};
          $EXTERNAL_DATA['acc'][key][local_alignment.uniprot] = data;
        }
      },
      error: function(e){
        console.log("ajax error");
        console.log(e);
      }
    }).always(function(){
      if(URL.length > 0){
        get_external_data( URL, d );
        return;
      }else{
        clear_wm();
        var key = local_alignment.pdb+":"+local_alignment.chain;
        if(local_imported_flag)key += ":"+local_accession;
        $EXTERNAL_DATA['PDBchain'][ key ] = d;
        build_ProtVista();
        return;
      }
    });
  }
}

var get_all_external_soruces = function( accession, alignment, input_URL, external_data, imported_flag ){
  local_accession = accession;
  local_imported_flag = imported_flag;
  local_alignment = alignment;

  var acc = local_accession;
  var key = local_alignment.pdb+":"+local_alignment.chain;

  if(top.$EXTERNAL_DATA && !local_imported_flag){
    $EXTERNAL_DATA = top.$EXTERNAL_DATA;
  }else if(top.$IMPORTED_DATA && local_imported_flag){
    $EXTERNAL_DATA = top.$IMPORTED_DATA;
  }else{
    $EXTERNAL_DATA = {'PDBchain':{},'acc':{}};
  }

  listURL = input_URL;
  if(local_imported_flag)key += ":"+acc
  if( $EXTERNAL_DATA && key in $EXTERNAL_DATA['PDBchain'] ){
    external_data = $EXTERNAL_DATA['PDBchain'][ key ];
    clear_wm();
    build_ProtVista();
  }else{
    var __allURL = listURL.slice(0);
    get_external_data(__allURL, external_data);
  }
};

module.exports = get_all_external_soruces;
