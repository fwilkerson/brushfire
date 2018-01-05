import muve from 'muve';

import {initialModel} from './model';
import {indexPage} from './views';

muve(indexPage, initialModel, document.getElementById('root'));
