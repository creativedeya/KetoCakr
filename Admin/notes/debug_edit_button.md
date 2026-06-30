# Debug: disabled condition on Save Changes button

## File
`Admin/app/dashboard/simple-recipes/[id]/EnhancedStepImages.tsx`

## str_replace — add log to ✏️ Edit button onClick

OLD:
```typescript
                      onClick={() => {
                        const sn = Number(step.step_number);
                        setEditTexts(prev => ({ ...prev, [sn]: step.step_description_bg || step.step_description || '' }));
                        setEditDurations(prev => ({ ...prev, [sn]: step.step_duration_minutes ?? 0 }));
                        setEditingStep(sn);
                      }}
```
NEW:
```typescript
                      onClick={() => {
                        const sn = Number(step.step_number);
                        const txt = step.step_description_bg || step.step_description || '';
                        const dur = step.step_duration_minutes ?? 0;
                        console.log('[EDIT CLICK] sn:', sn, 'txt:', txt, 'dur:', dur);
                        setEditTexts(prev => {
                          const next = { ...prev, [sn]: txt };
                          console.log('[EDIT CLICK] editTexts after set:', next);
                          return next;
                        });
                        setEditDurations(prev => ({ ...prev, [sn]: dur }));
                        setEditingStep(sn);
                      }}
```

## str_replace — add log to Save button disabled check

OLD:
```typescript
                      <button
                        type="button"
                        onClick={() => saveDescription(Number(step.step_number))}
                        disabled={savingDescription === Number(step.step_number) || !editTexts[Number(step.step_number)]?.trim()}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                      >
                        {savingDescription === step.step_number ? '⏳ Saving...' : '💾 Save Changes'}
                      </button>
```
NEW:
```typescript
                      <button
                        type="button"
                        onClick={() => saveDescription(Number(step.step_number))}
                        disabled={savingDescription === Number(step.step_number) || !editTexts[Number(step.step_number)]?.trim()}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                        onMouseEnter={() => {
                          const sn = Number(step.step_number);
                          console.log('[SAVE BTN hover] sn:', sn,
                            'editTexts[sn]:', editTexts[sn],
                            'trim:', editTexts[sn]?.trim(),
                            'savingDescription:', savingDescription,
                            'disabled:', savingDescription === sn || !editTexts[sn]?.trim()
                          );
                        }}
                      >
                        {savingDescription === step.step_number ? '⏳ Saving...' : '💾 Save Changes'}
                      </button>
```
