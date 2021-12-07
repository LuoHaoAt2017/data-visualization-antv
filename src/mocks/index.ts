import Mock, { Random } from "mockjs";
import { Level } from '../helper/index';

Mock.setup({
  timeout: 3000
});

Random.extend({
  level: function() {
    const level = Random.integer(0, 5);
    if (level === 1) {
      return Level.Brahman;
    } else if (level === 2) {
      return Level.Kshatriya;
    }  else if (level === 3) {
      return Level.Vaisha;
    }  else if (level === 4) {
      return Level.Sudra;
    }  else {
      return Level.Untouchables;
    }
  },
  age: function() {
    return Random.integer(0, 100)
  },
  gender: function() {
    return Random.boolean();
  }
});

Mock.mock('/caste-system', function() {
  return Mock.mock({
    'list|50': [
      {
        level: '@level',
        age: '@age',
        gender: '@gender'
      }
    ]
  }).list;
});

export default Mock;