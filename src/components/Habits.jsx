import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { Target, TrendingUp, Flame, Calendar, CheckCircle2, Circle, Lock, ArrowRight } from 'lucide-react';
import { Card, Button, Badge, ProgressBar } from './UI';
import INITIAL_DATA from '../data/initialData';

// ═══════════════════════════════════════════════════════════════
// HABITS COMPONENT - SINGLE HABIT FOCUS 🎯
// ═══════════════════════════════════════════════════════════════
export default function Habits() {
  const { habits } = INITIAL_DATA;
  const [selectedDay, setSelectedDay] = useState(null);

  // Calculate progress
  const currentHabit = habits.current;
  const weekProgress = currentHabit.weeklyGrid.filter(d => d.completed).length;
  const weekPercentage = Math.round((weekProgress / 7) * 100);
  const totalProgress = Math.round((currentHabit.currentValue / currentHabit.targetValue) * 100);

  // Days of week
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="min-h-screen bg-[#FDFCF6] p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#2D3436] mb-2">Habit Tracker</h1>
          <p className="text-[#7A8A7D]">One habit at a time. Build momentum, see results 🎯</p>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            PHILOSOPHY BANNER
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-[#D5F4E6] to-[#E6E3F5]">
            <div className="flex items-start gap-4">
              <Target className="w-8 h-8 text-[#80D6D6] flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-[#2D3436] mb-2">Why One Habit?</h3>
                <p className="text-[#7A8A7D] leading-relaxed">
                  Your brain can only handle <strong>one meaningful change at a time</strong>. 
                  Trying to do everything = doing nothing. Focus here, build a rock-solid foundation, 
                  then move to the next. This is how lasting transformation happens. 🌱
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* ═══════════════════════════════════════════════════════════════
              LEFT COLUMN - CURRENT HABIT FOCUS
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Habit Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-gradient-to-br from-[#80D6D6]/10 to-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#80D6D6] to-[#C5A3FF] flex items-center justify-center text-3xl">
                      {currentHabit.emoji}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#2D3436] mb-1">{currentHabit.name}</h2>
                      <p className="text-[#7A8A7D]">{currentHabit.description}</p>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                {/* Progress Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-[#80D6D6] mb-1">
                      {currentHabit.currentValue}{currentHabit.unit}
                    </div>
                    <div className="text-xs text-[#7A8A7D]">Current</div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-[#C5A3FF] mb-1">
                      {currentHabit.targetValue}{currentHabit.unit}
                    </div>
                    <div className="text-xs text-[#7A8A7D]">Target</div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 text-center">
                    <div className="text-3xl font-bold text-[#FFB5C0] mb-1">
                      Week {currentHabit.currentWeek}/{currentHabit.totalWeeks}
                    </div>
                    <div className="text-xs text-[#7A8A7D]">Progress</div>
                  </div>
                </div>

                {/* Overall Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-[#7A8A7D]">Overall Progress</span>
                    <span className="text-sm font-bold text-[#80D6D6]">{totalProgress}%</span>
                  </div>
                  <ProgressBar progress={totalProgress} color="#80D6D6" />
                </div>

                {/* Streak Counter */}
                <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[#FFE5D9] to-[#FFE5E8] rounded-2xl">
                  <Flame className="w-6 h-6 text-[#FF9B9B]" />
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#FF9B9B]">{currentHabit.streak}</div>
                    <div className="text-xs text-[#7A8A7D]">Day Streak 🔥</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Weekly Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-[#2D3436]">This Week's Progress</h3>
                  <Badge variant={weekPercentage === 100 ? 'success' : 'info'}>
                    {weekProgress}/7 days
                  </Badge>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-3 mb-4">
                  {currentHabit.weeklyGrid.map((day, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setSelectedDay(index)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`aspect-square rounded-2xl p-4 flex flex-col items-center justify-center transition-all ${
                        day.completed
                          ? 'bg-gradient-to-br from-[#80D6D6] to-[#C5A3FF] text-white shadow-lg'
                          : day.isToday
                          ? 'bg-gradient-to-br from-[#FFE5D9] to-[#FFE5E8] border-2 border-[#FFB5C0]'
                          : 'bg-[#F8F6ED] hover:bg-white'
                      }`}
                    >
                      <div className={`text-xs font-bold mb-2 ${
                        day.completed ? 'text-white' : 'text-[#7A8A7D]'
                      }`}>
                        {daysOfWeek[index]}
                      </div>
                      {day.completed ? (
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      ) : day.isToday ? (
                        <Circle className="w-8 h-8 text-[#FFB5C0]" />
                      ) : (
                        <Circle className="w-8 h-8 text-[#D5CDB8]" />
                      )}
                      {day.value && (
                        <div className={`text-xs mt-2 font-semibold ${
                          day.completed ? 'text-white' : 'text-[#7A8A7D]'
                        }`}>
                          {day.value}{currentHabit.unit}
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Week Progress Bar */}
                <ProgressBar progress={weekPercentage} color="#80D6D6" />
                <p className="text-sm text-[#7A8A7D] text-center mt-2">
                  {weekPercentage === 100 
                    ? '🎉 Perfect week! Keep it up!' 
                    : `${7 - weekProgress} more day${7 - weekProgress === 1 ? '' : 's'} to go!`}
                </p>
              </Card>
            </motion.div>

            {/* Motivation Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-r from-[#E6E3F5] to-[#D5F4E6]">
                <h3 className="text-lg font-bold text-[#2D3436] mb-3">💪 Why You're Doing This</h3>
                <p className="text-[#7A8A7D] leading-relaxed mb-4">{currentHabit.motivation}</p>
                <div className="flex items-center gap-2 text-sm text-[#9B8AA3]">
                  <TrendingUp className="w-4 h-4" />
                  <span>Started: {currentHabit.startDate}</span>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              RIGHT COLUMN - UPCOMING HABITS & BODY TRACKER
              ═══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick Action Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="bg-gradient-to-br from-[#FFE5D9] to-white text-center">
                <Calendar className="w-12 h-12 text-[#FFB5C0] mx-auto mb-3" />
                <h3 className="text-lg font-bold text-[#2D3436] mb-2">Today's Action</h3>
                <p className="text-[#7A8A7D] mb-4">
                  {currentHabit.weeklyGrid.find(d => d.isToday)?.completed
                    ? '✅ Already done! Amazing!'
                    : `Run ${currentHabit.currentValue}${currentHabit.unit} today`}
                </p>
                <Button className="w-full">
                  {currentHabit.weeklyGrid.find(d => d.isToday)?.completed
                    ? 'View Details'
                    : 'Mark Complete'}
                </Button>
              </Card>
            </motion.div>

            {/* Circular Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="text-center">
                <h3 className="text-lg font-bold text-[#2D3436] mb-4">Journey Progress</h3>
                <div className="w-40 h-40 mx-auto mb-4">
                  <CircularProgressbar
                    value={totalProgress}
                    text={`${totalProgress}%`}
                    styles={buildStyles({
                      textSize: '16px',
                      pathColor: '#80D6D6',
                      textColor: '#80D6D6',
                      trailColor: '#F8F6ED',
                    })}
                  />
                </div>
                <p className="text-sm text-[#7A8A7D]">
                  {currentHabit.currentValue}{currentHabit.unit} → {currentHabit.targetValue}{currentHabit.unit}
                </p>
              </Card>
            </motion.div>

            {/* Body Transformation Tracker - MAKE IT CELEBRATORY! */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-[#FFE5E8] to-white">
                <h3 className="text-lg font-bold text-[#2D3436] mb-2" style={{fontFamily: 'Playfair Display, serif'}}>💪 Body Transformation</h3>
                <p className="text-xs text-[#7A8A7D] mb-4" style={{fontFamily: 'Caveat, cursive'}}>Look how far you've come!</p>
                <div className="space-y-3">
                  {habits.bodyTracking.map((metric, index) => {
                    // Calculate improvement
                    const startNum = parseFloat(metric.start);
                    const currentNum = parseFloat(metric.current);
                    const improvement = Math.abs(startNum - currentNum);
                    const isPositive = metric.name.includes('Weight') || metric.name.includes('Body Fat') 
                      ? currentNum < startNum 
                      : currentNum > startNum;

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-2.5 bg-white rounded-xl border-2 border-[#FFE5E8]"
                      >
                        {/* Celebratory Header */}
                        <div className="flex items-center gap-2 mb-1.5">
                          {metric.name === 'Weight' && <span className="text-xl">🎯</span>}
                          {metric.name === 'Body Fat %' && <span className="text-xl">🔥</span>}
                          {metric.name === 'Resting HR' && <span className="text-xl">❤️</span>}
                          <span className="text-xs font-bold text-[#2D3436]">
                            {metric.name === 'Weight' && '💪 Weight Lost'}
                            {metric.name === 'Body Fat %' && '🔥 Body Fat Down'}
                            {metric.name === 'Resting HR' && '❤️ Heart Stronger'}
                          </span>
                        </div>
                        
                        {/* Achievement */}
                        <div className="text-center mb-1.5">
                          <span className="text-2xl font-black text-[#FF9B9B]">
                            {improvement}{metric.unit}!
                          </span>
                        </div>

                        {/* Before → After */}
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span className="text-[#9B8AA3] line-through">{metric.start}</span>
                          <ArrowRight className="w-3 h-3 text-[#7DD3C0]" />
                          <span className="font-bold text-[#7DD3C0] text-base">{metric.current}</span>
                        </div>

                        {/* Motivational Message */}
                        <p className="text-xs text-center text-[#7A8A7D] mt-1.5 italic">
                          {metric.name === 'Weight' && "Getting lighter! 🌟"}
                          {metric.name === 'Body Fat %' && "Leaner every day! 💪"}
                          {metric.name === 'Resting HR' && "Heart loves this! ❤️"}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Upcoming Habits */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <h3 className="text-lg font-bold text-[#2D3436] mb-4">Up Next</h3>
                <div className="space-y-3">
                  {habits.upcoming.map((habit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-[#F8F6ED] rounded-xl opacity-60"
                    >
                      <Lock className="w-5 h-5 text-[#9B8AA3] flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{habit.emoji}</span>
                          <h4 className="font-bold text-[#7A8A7D]">{habit.name}</h4>
                        </div>
                        <p className="text-xs text-[#9B8AA3]">{habit.description}</p>
                        <p className="text-xs text-[#9B8AA3] mt-2">
                          Unlocks: {habit.unlockDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#9B8AA3] text-center mt-4">
                  Complete current habit to unlock next one 🔓
                </p>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
