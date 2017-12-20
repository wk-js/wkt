#!/usr/bin/env node
'use strict'

import { Boilerplate } from '../lib'

const bp = new Boilerplate('.tmp/example/template.js', '.tmp/generated')
bp.resolve().then( bp.execute )