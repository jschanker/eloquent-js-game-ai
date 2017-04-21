
    function resetLevel(n) {
      return new Level(n);
    }
    
    function runAILevel(level, moveSeq, Display, andThen) {
      var display = new Display(document.body, level);
      var currentMoveIndex = 0;
      
      runAnimation(function(step) {
        if(currentMoveIndex < moveSeq.length) {
          arrows = moveSeq[currentMoveIndex];
          currentMoveIndex++;
        } else {
          arrows = {};
        }
        level.animate(step, arrows);
        display.drawFrame(step);
        if (level.isFinished()) {
          display.clear();
        if (andThen)
          andThen(level.status);
        return false;
        }
     });
   }
    
    Vector.prototype.copy = function() {
      vectorCp = Object.create(Vector.prototype);
      vectorCp.x = this.x;
      vectorCp.y = this.y;
      
      return vectorCp;
    }
    
    Player.prototype.copy = function() {
      playerCp = Object.create(Player.prototype);
      playerCp.pos = this.pos.copy();
      playerCp.size = this.size.copy();
      playerCp.speed = this.speed.copy();
      
      return playerCp;
    }
    
    Lava.prototype.copy = function() {
      lavaCp = Object.create(Lava.prototype);
      
      lavaCp.pos = this.pos.copy();
      lavaCp.size = this.size.copy();
      lavaCp.speed = this.speed.copy();
      lavaCp.repeatPos = this.repeatPos ? this.repeatPos.copy() : this.repeatPos;
      
      return lavaCp;
    }
    
    Coin.prototype.copy = function() {
      coinCp = Object.create(Coin.prototype);
      
      coinCp.basePos = this.basePos.copy();
      coinCp.pos = this.pos.copy();
      coinCp.size = this.size.copy();
      coinCp.wobble = this.wobble;
      
      return coinCp;
    }
    
    Level.prototype.copy = function() {
      levelCp = Object.create(Level.prototype);
      levelCp.width = this.width;
      levelCp.height = this.height;
      
      levelCp.actors = this.actors.map(function(actor) {
        return actor.copy();
      });
      
      grid = [];
      for(var y = 0; y < this.height; y++) {
        gridLine = [];
        for(var x = 0; x < this.width; x++) {
          gridLine.push(this.grid[y][x]);
        }
        grid.push(gridLine);
      }
      levelCp.grid = grid;
 	  levelCp.player = levelCp.actors.filter(function(actor) {
        return actor.type == "player";
      })[0];
      levelCp.status = this.status;
      
      return levelCp;
    }
    
    memo = {};
    movesList = [{up: true}, 
                 {right: true}, 
                 {left: true}, 
                 {up: true, right: true},
                 {up: true, left: true},
                 {}
                ];
    
    function bestStrategy(level, maxMoves) {
      if(level.status === "lost") {
        return -1;
      }
      else if(level.status) {
        return [];
      }
      else if(maxMoves <= 0) {
        return 0;
      }
      else {
        var moveSeq;
        var key = JSON.stringify(level) + maxMoves;
        if(key in memo) {
          moveSeq = memo[key];
        } else {
          moveSeq = movesList.reduce(function(acc, move) {
            //console.log(level.actors.filter(function(p) { return p instanceof Player }));
            //console.log(level.actors.filter(function(p) { return p instanceof Coin }));
            //console.log(level.player);
            var levelCp = level.copy();
            levelCp.animate(2, move);
            var moveSeqOpt = bestStrategy(levelCp, maxMoves-1);
            if(!(acc instanceof Array)) {
              if(moveSeqOpt instanceof Array) {
                return [move].concat(moveSeqOpt);
              } 
              else {
              	return Math.max(acc, moveSeqOpt);
              }
            } else {
              if(moveSeqOpt instanceof Array) {
                return acc.length <= moveSeqOpt.length ? acc : [move].concat(moveSeqOpt);
              } else {
                return acc;
              }
            }
          }, -1);
        }
        
        memo[key] = moveSeq;
        return moveSeq;
      }
    }
    var testLevelPlan = [
      "                      ",
      "                      ",
      "  x              = x  ",
      "  x   o     x x    x  ",
      "  x @ x    xxxxx   x  ",
      "  xxxxx            x  ",
      "      x!!!!!!!!!!!!x  ",
      "      xxxxxxxxxxxxxx  ",
      "                      "
	];
    
    var testLevel = new Level(testLevelPlan);
    var waitSeq = [{}, {}, {}, {}, {}, {}, {}, {}];
    for(var c = 0; c < 4; c++) {
    	waitSeq = waitSeq.concat(waitSeq);
    }
    var aiSeq = bestStrategy(testLevel, 4);
    var aiMoveSeq = waitSeq.slice();
    aiMoveSeq = [];
    for(var d = 0; d < aiSeq.length; d++) {
      for(var e = 0; e < 7; e++) {
        aiMoveSeq.push(aiSeq[d]);
      }
    }
    console.log(aiSeq);
    //setTimeout(function() {
    function repeatAI() {
      runAILevel(testLevel, aiMoveSeq, CanvasDisplay);
    }
    //}, 1000);
    //runGame(GAME_LEVELS, CanvasDisplay);