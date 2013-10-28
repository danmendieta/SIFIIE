function protegido(req, res, next){
    if(req.session.user){
      next();
    }else{
      console.log('URL='+req.url);
      res.redirect('/session/new?redir='+req.url);
    }
  }